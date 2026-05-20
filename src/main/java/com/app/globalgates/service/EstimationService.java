package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.common.enumeration.NotificationType;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.EstimationDTO;
import com.app.globalgates.dto.EstimationExpertDTO;
import com.app.globalgates.dto.EstimationTagDTO;
import com.app.globalgates.dto.EstimationWithPagingDTO;
import com.app.globalgates.dto.NotificationDTO;
import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.repository.EstimationDAO;
import com.app.globalgates.repository.EstimationTagDAO;
import com.app.globalgates.repository.MemberDAO;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class EstimationService {
    private final EstimationDAO estimationDAO;
    private final EstimationTagDAO estimationTagDAO;
    private final MemberDAO memberDAO;
    private final PostProductService postProductService;
    private final NotificationService notificationService;

    @LogStatus
    public void write(EstimationDTO estimationDTO) {
        if (estimationDTO.getStatus() == null) {
            estimationDTO.setStatus("requesting");
        }

        if (estimationDTO.getReceiverId() == null
                && estimationDTO.getReceiverEmail() != null
                && !estimationDTO.getReceiverEmail().isBlank()) {
            memberDAO.findMemberByMemberEmail(estimationDTO.getReceiverEmail())
                    .ifPresent(memberDTO -> estimationDTO.setReceiverId(memberDTO.getId()));
        }

        estimationDTO.setTags(normalizeTags(estimationDTO.getTags()));
        estimationDAO.save(estimationDTO);

        estimationDTO.getTags().forEach(tagDTO -> {
            Optional<EstimationTagDTO> foundTag = estimationTagDAO.findByTagName(tagDTO.getTagName());

            if (foundTag.isEmpty()) {
                estimationTagDAO.save(tagDTO);
            } else {
                tagDTO.setId(foundTag.get().getId());
            }

            if (tagDTO.getId() == null) {
                tagDTO.setId(estimationTagDAO.findByTagName(tagDTO.getTagName()).orElseThrow().getId());
            }

            estimationTagDAO.saveRel(estimationDTO.getId(), tagDTO.getId());
        });

        // 견적 요청 알림
        if (estimationDTO.getReceiverId() != null
                && !estimationDTO.getReceiverId().equals(estimationDTO.getRequesterId())) {
            NotificationDTO noti = new NotificationDTO();
            noti.setRecipientId(estimationDTO.getReceiverId());
            noti.setSenderId(estimationDTO.getRequesterId());
            noti.setNotificationType(NotificationType.ESTIMATION);
            noti.setTitle("견적 요청");
            noti.setContent("새 견적 요청이 도착했습니다.");
            noti.setTargetId(estimationDTO.getId());
            noti.setTargetType("estimation");
            notificationService.createNotification(noti);
        }
    }

    @Transactional(readOnly = true)
    @LogStatusWithReturn
    public EstimationWithPagingDTO getList(int page, Long receiverId) {
        Criteria criteria = new Criteria(page, receiverId == null ? 0 : estimationDAO.findTotal(receiverId));
        List<EstimationDTO> estimations =
                receiverId == null ? List.of() : estimationDAO.findAll(criteria, receiverId);

        criteria.setHasMore(estimations.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            estimations.remove(estimations.size() - 1);
        }

        estimations.forEach(estimationDTO ->
                estimationDTO.setTags(estimationTagDAO.findAllByEstimationId(estimationDTO.getId()))
        );

        EstimationWithPagingDTO estimationWithPagingDTO = new EstimationWithPagingDTO();
        estimationWithPagingDTO.setEstimations(estimations);
        estimationWithPagingDTO.setCriteria(criteria);
        return estimationWithPagingDTO;
    }

    @Transactional(readOnly = true)
    @LogStatusWithReturn
    public EstimationWithPagingDTO getRequestedList(int page, Long requesterId) {
        Criteria criteria = new Criteria(page, requesterId == null ? 0 : estimationDAO.findRequestedTotal(requesterId));
        List<EstimationDTO> estimations =
                requesterId == null ? List.of() : estimationDAO.findRequestedAll(criteria, requesterId);

        criteria.setHasMore(estimations.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            estimations.remove(estimations.size() - 1);
        }

        estimations.forEach(estimationDTO ->
                estimationDTO.setTags(estimationTagDAO.findAllByEstimationId(estimationDTO.getId()))
        );

        EstimationWithPagingDTO estimationWithPagingDTO = new EstimationWithPagingDTO();
        estimationWithPagingDTO.setEstimations(estimations);
        estimationWithPagingDTO.setCriteria(criteria);
        return estimationWithPagingDTO;
    }

    @Transactional(readOnly = true)
    @LogStatusWithReturn
    public Optional<EstimationDTO> getDetail(Long id) {
        Optional<EstimationDTO> estimation = estimationDAO.findById(id);
        estimation.ifPresent(estimationDTO ->
                estimationDTO.setTags(estimationTagDAO.findAllByEstimationId(estimationDTO.getId()))
        );
        return estimation;
    }

    @LogStatusWithReturn
    public boolean updateStatus(Long id, Long receiverId, String status) {
        if (id == null || receiverId == null || status == null || status.isBlank()) {
            return false;
        }

        if (!"approve".equals(status) && !"reject".equals(status)) {
            return false;
        }

        boolean updated = estimationDAO.updateStatus(id, receiverId, status);

        if (updated && "approve".equals(status)) {
            estimationDAO.findById(id).ifPresent(estimationDTO -> {
                Long requesterId = estimationDTO.getRequesterId();
                if (requesterId != null && !requesterId.equals(receiverId)) {
                    NotificationDTO noti = new NotificationDTO();
                    noti.setRecipientId(requesterId);
                    noti.setSenderId(receiverId);
                    noti.setNotificationType(NotificationType.APPROVE);
                    noti.setTitle("견적 승인");
                    noti.setContent("견적 요청이 승인되었습니다.");
                    noti.setTargetId(id);
                    noti.setTargetType("estimation");
                    notificationService.createNotification(noti);
                }
            });
        }

        return updated;
    }

    @Transactional(readOnly = true)
    @LogStatusWithReturn
    public List<EstimationExpertDTO> getExpertsForRequest(int page, Long memberId, String keyword) {
        if (memberId == null) {
            return List.of();
        }

        String normalizedKeyword = keyword == null ? null : keyword.trim();
        if (normalizedKeyword != null && normalizedKeyword.isBlank()) {
            normalizedKeyword = null;
        }

        // page는 1부터, offset은 (page - 1) * pageSize. 음수는 막는다.
        int offset = Math.max(0, (page - 1) * 20);
        return estimationDAO.findExpertsForRequest(memberId, normalizedKeyword, offset);
    }

    @Transactional(readOnly = true)
    @LogStatusWithReturn
    public List<PostProductDTO> getProductsForRequest(Long memberId) {
        if (memberId == null) {
            return List.of();
        }

        return postProductService.getMyProducts(memberId);
    }

    private List<EstimationTagDTO> normalizeTags(List<EstimationTagDTO> tags) {
        if (tags == null) {
            return List.of();
        }

        return tags.stream()
                .filter(tagDTO -> tagDTO.getTagName() != null && !tagDTO.getTagName().isBlank())
                .collect(Collectors.toMap(
                        tagDTO -> tagDTO.getTagName().trim().replaceFirst("^#", ""),
                        tagDTO -> EstimationTagDTO.builder()
                                .id(tagDTO.getId())
                                .tagName(tagDTO.getTagName().trim().replaceFirst("^#", ""))
                                .build(),
                        (left, right) -> left
                ))
                .values()
                .stream()
                .collect(Collectors.toList());
    }
}
