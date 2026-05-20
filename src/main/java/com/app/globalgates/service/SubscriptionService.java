package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.BadgeType;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import com.app.globalgates.domain.BadgeVO;
import com.app.globalgates.dto.PaymentSubscribeDTO;
import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.repository.BadgeDAO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.SubscriptionDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class SubscriptionService {
    private final SubscriptionDAO subscriptionDAO;
    private final MemberDAO memberDAO;
    private final BadgeDAO badgeDAO;
    private final BootpayBillingService bootpayBillingService;
    private final PaymentSubscribeService paymentSubscribeService;

    //    검사
    @CacheEvict(value = {"post:list", "post", "community:post:list", "member", "community:member:list"}, allEntries = true)
    public void managingSchedule() {
        List<SubscriptionDTO> checkSubList = subscriptionDAO.findExpiredMembers();
        checkSubList.forEach((each) -> {
            //    월간갱신 (quartz=true) -> 빌링키로 정기결제 청구 후 만료일 갱신
            if(each.isQuartz() && each.getBillingCycle().equals("monthly")){
                log.info("월갱신 들어옴 — 빌링키 청구 시도함.");

                if (each.getBillingKey() == null || each.getBillingKey().isBlank()) {
                    log.warn("빌링키 없음 — 만료 처리. subscriptionId={}", each.getId());
                    expireSubscription(each);
                    return;
                }

                String orderId = "SUB_RENEW_" + each.getMemberId() + "_" + System.currentTimeMillis();
                String orderName = each.getTier().getValue() + " 월간 갱신";
                BootpayBillingService.BillingResult result = bootpayBillingService.charge(
                        each.getBillingKey(),
                        each.getAmount(),
                        orderName,
                        orderId,
                        orderName,
                        each.getMemberId()
                );

                if (result.isSuccess()) {
                    subscriptionDAO.setExpiresAt(each.getId());
                    PaymentSubscribeDTO payment = new PaymentSubscribeDTO();
                    payment.setSubscriptionId(each.getId());
                    payment.setMemberId(each.getMemberId());
                    payment.setAmount(each.getAmount());
                    payment.setPaymentStatus(PaymentStatus.COMPLETED);
                    payment.setPaymentMethod("billing");
                    payment.setReceiptId(result.getReceiptId());
                    payment.setPaidAt(java.time.LocalDateTime.now().toString());
                    paymentSubscribeService.save(payment);
                    log.info("월간 정기결제 갱신 성공 receiptId={}", result.getReceiptId());
                } else {
                    log.warn("월간 정기결제 갱신 실패 — 만료 처리. message={}", result.getMessage());
                    expireSubscription(each);
                }
            }
            //    그 외 -> 만료 처리
            else {
                log.info("만료들어옴");
                expireSubscription(each);
            }
        }

        );
    }

    //    구독 만료 + 뱃지/role 없앰
    private void expireSubscription(SubscriptionDTO sub) {
        subscriptionDAO.setStatus(sub.getId(), SubscriptionStatus.EXPIRED);
        badgeDAO.deleteByMemberId(sub.getMemberId());
        memberDAO.setMemberRole(sub.getMemberId(), MemberRole.BUSINESS);
        log.info("만료 처리 완료 subscriptionId={}", sub.getId());
    }

    //    월별 구독자 해지
    public void cancel(Long id, Long memberId) {
        Optional<SubscriptionDTO> willCancelMember = subscriptionDAO.findByMemberId(memberId);
            if (willCancelMember.get().getBillingCycle().equals("annual")) {
                throw new RuntimeException("연간 구독은 해지 불가입니다.");
            }
            log.info("구독해지 들어옴");
            subscriptionDAO.setQuartz(id, false);
            log.info("구독해지 '완'. 쿼츠 false로 세팅.");
    }

    //    구독 + badge + member_role (ID 반환)
    @CacheEvict(value = {"post:list", "post", "community:post:list", "member", "community:member:list"}, allEntries = true)
    public Long subscribe(SubscriptionDTO subscriptionDTO) {
        log.info("들어옴1");

        //    EXPERT 티어는 연간 구독 불가
        if (subscriptionDTO.getTier() == SubscriptionTier.EXPERT
                && "annual".equals(subscriptionDTO.getBillingCycle())) {
            throw new RuntimeException("Expert 플랜은 월간 구독만 가능합니다.");
        }

        Long memberId = subscriptionDTO.getMemberId();
        SubscriptionTier tier = subscriptionDTO.getTier();

        //    월간 + 빌링키가 있으면: 프론트가 보낸 값은 receipt_id 이므로 실제 billing_key 로 변환 후 저장
        boolean isMonthlyBilling = "monthly".equals(subscriptionDTO.getBillingCycle())
                && subscriptionDTO.getBillingKey() != null
                && !subscriptionDTO.getBillingKey().isBlank();
        if (isMonthlyBilling) {
            String resolvedBillingKey = bootpayBillingService.resolveBillingKey(subscriptionDTO.getBillingKey());
            log.info("billing_key 변환 — receipt_id={} → billing_key={}",
                    subscriptionDTO.getBillingKey(), resolvedBillingKey);
            subscriptionDTO.setBillingKey(resolvedBillingKey);
        }

        subscriptionDTO.setStatus(SubscriptionStatus.ACTIVE);
        subscriptionDAO.save(subscriptionDTO);
        log.info("들어옴2");

        if (isMonthlyBilling) {
            log.info("월간 정기결제 첫 청구 시작");
            String orderId = "SUB_FIRST_" + memberId + "_" + System.currentTimeMillis();
            String orderName = tier.getValue() + " 월간";
            BootpayBillingService.BillingResult result = bootpayBillingService.charge(
                    subscriptionDTO.getBillingKey(),
                    subscriptionDTO.getAmount(),
                    orderName,
                    orderId,
                    orderName,
                    memberId
            );
            if (!result.isSuccess()) {
                throw new RuntimeException("첫 정기결제 실패: " + result.getMessage());
            }
            //    결제 기록 저장
            PaymentSubscribeDTO payment = new PaymentSubscribeDTO();
            payment.setSubscriptionId(subscriptionDTO.getId());
            payment.setMemberId(memberId);
            payment.setAmount(subscriptionDTO.getAmount());
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setPaymentMethod("billing");
            payment.setReceiptId(result.getReceiptId());
            payment.setPaidAt(java.time.LocalDateTime.now().toString());
            paymentSubscribeService.save(payment);
            log.info("월간 정기결제 첫 청구 성공 receiptId={}", result.getReceiptId());
        }

        //    expert 구독은 member_role을 expert로 변경
        if (tier == SubscriptionTier.EXPERT) {
            memberDAO.setMemberRole(memberId, MemberRole.EXPERT);
            log.info("expert구독 들어옴");
        }

        //    tier에 따라 badge 부여 (free 제외)
        if (tier != SubscriptionTier.FREE) {
            BadgeType badgeType = BadgeType.getBadgeType(tier.getValue());
            Optional<BadgeVO> existingBadge = badgeDAO.findByMemberId(memberId);
            if (existingBadge.isPresent()) {
                badgeDAO.setBadgeType(existingBadge.get().getId(), badgeType);
            } else {
                badgeDAO.save(BadgeVO.builder()
                        .memberId(memberId)
                        .badgeType(badgeType)
                        .build());
            }
        }

        log.info("들어옴3");
        return subscriptionDTO.getId();
    }

    //    로그인한사람 어떤 구독인지조회
    public Optional<SubscriptionDTO> findByMemberId(Long memberId) {
        return subscriptionDAO.findByMemberId(memberId);
    }

}
