package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.common.exception.MemberLoginFailException;
import com.app.globalgates.common.exception.MemberNotFoundException;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.*;
import com.app.globalgates.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {
    private final MemberDAO memberDAO;
    private final MemberProfileFileDAO memberProfileFileDAO;
    private final BusinessMemberDAO businessMemberDAO;
    private final FileDAO fileDAO;
    private final CategoryMemberDAO categoryMemberDAO;
    private final CategoryDAO categoryDAO;
    private final OAuthDAO oAuthDAO;
    private final NotificationPreferenceDAO notificationPreferenceDAO;
    private final PasswordEncoder passwordEncoder;

    //  일반 회원가입
    @Transactional
    @LogStatus
    public void join(MemberDTO memberDTO, MultipartFile profile){
        memberDTO.setMemberPassword(passwordEncoder.encode(memberDTO.getMemberPassword()));
        memberDAO.save(memberDTO);
        log.info(memberDTO.toBusinessMemberVO().toString());

        // 사업자 정보 저장
        BusinessMemberDTO businessMemberDTO = new BusinessMemberDTO();
        businessMemberDTO.setId(memberDTO.getId());
        businessMemberDTO.setBusinessNumber(memberDTO.getBusinessNumber());
        businessMemberDTO.setCompanyName(memberDTO.getCompanyName());
        businessMemberDTO.setCeoName(memberDTO.getCeoName());
        businessMemberDTO.setBusinessType(memberDTO.getBusinessType());
        businessMemberDAO.save(businessMemberDTO.toBusinessMemberVO());

        // 회원가입 정보에서 가져온 카테고리 이름으로 카테고리 조회
        CategoryDTO categoryDTO = categoryDAO.findByCategoryName(memberDTO.getCategoryName())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));

        // 사업자 관심사 저장
        CategoryMemberDTO categoryMemberDTO = new CategoryMemberDTO();
        categoryMemberDTO.setMemberId(memberDTO.getId());
        categoryMemberDTO.setCategoryId(categoryDTO.getId());
        categoryMemberDAO.save(categoryMemberDTO);
    }

    @Transactional
    @LogStatus
    public void joinOAuth(MemberDTO memberDTO, MultipartFile profile, String s3Key) {
        // OAuth 신규가입은 일반 회원가입과 달리 비밀번호 암호화를 하지 않는다.
        // 이미 OAuth 인증을 마친 사용자가 추가정보만 입력한 뒤 최종 가입하는 흐름이다.

        // 1. 회원 본체 저장
        memberDAO.save(memberDTO);

        // 2. 사업자 정보 저장
        BusinessMemberDTO businessMemberDTO = new BusinessMemberDTO();
        businessMemberDTO.setId(memberDTO.getId());
        businessMemberDTO.setBusinessNumber(memberDTO.getBusinessNumber());
        businessMemberDTO.setCompanyName(memberDTO.getCompanyName());
        businessMemberDTO.setCeoName(memberDTO.getCeoName());
        businessMemberDTO.setBusinessType(memberDTO.getBusinessType());
        businessMemberDAO.save(businessMemberDTO.toBusinessMemberVO());

        // 3. 카테고리 조회 후 회원 관심사 저장
        CategoryDTO categoryDTO = categoryDAO.findByCategoryName(memberDTO.getCategoryName())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));

        CategoryMemberDTO categoryMemberDTO = new CategoryMemberDTO();
        categoryMemberDTO.setMemberId(memberDTO.getId());
        categoryMemberDTO.setCategoryId(categoryDTO.getId());
        categoryMemberDAO.save(categoryMemberDTO);

        // 4. OAuth 연동 정보 저장
        OAuthDTO oAuthDTO = new OAuthDTO();
        oAuthDTO.setProvider(memberDTO.getProvider());
        oAuthDTO.setProviderId(memberDTO.getProviderId());
        oAuthDTO.setProfileURL(memberDTO.getProfileURL());
        oAuthDTO.setMemberId(memberDTO.getId());
        oAuthDAO.save(oAuthDTO.toOAuthVO());

        // 5. 프로필 이미지를 직접 업로드한 경우 파일 정보 저장
        if (profile != null && !profile.isEmpty() && s3Key != null && !s3Key.isBlank()) {
            saveFile(memberDTO.getId(), profile, s3Key);
        }
    }

    //  프로필 이미지 저장
    @Transactional
    @LogStatus
    public void saveFile(Long memberId, MultipartFile image, String s3Key) {
        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName(image.getOriginalFilename());
        fileDTO.setFileName(s3Key);
        fileDTO.setFilePath(getTodayPath());
        fileDTO.setFileSize(image.getSize());
        fileDTO.setContentType(image.getContentType().contains("image") ? FileContentType.IMAGE : FileContentType.ETC);
        fileDAO.save(fileDTO);

        MemberProfileFileDTO memberProfileFileDTO = new MemberProfileFileDTO();
        memberProfileFileDTO.setId(fileDTO.getId());
        memberProfileFileDTO.setMemberId(memberId);
        memberProfileFileDTO.setProfileImageType(ProfileImageType.PROFILE);
        memberProfileFileDAO.save(memberProfileFileDTO);
    }

    //  배너 이미지 저장
    @Transactional
    @LogStatus
    public void saveBannerFile(Long memberId, MultipartFile image, String s3Key) {
        // 프로필 이미지 저장 로직과 같은 구조를 유지하되,
        // 회원-파일 관계만 배너 전용 mapper를 타도록 분리한다.
        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName(image.getOriginalFilename());
        fileDTO.setFileName(s3Key);
        fileDTO.setFilePath(getTodayPath());
        fileDTO.setFileSize(image.getSize());
        fileDTO.setContentType(image.getContentType().contains("image") ? FileContentType.IMAGE : FileContentType.ETC);
        fileDAO.save(fileDTO);

        MemberProfileFileDTO memberProfileFileDTO = new MemberProfileFileDTO();
        memberProfileFileDTO.setId(fileDTO.getId());
        memberProfileFileDTO.setMemberId(memberId);
        memberProfileFileDTO.setProfileImageType(ProfileImageType.BANNER);
        memberProfileFileDAO.saveBanner(memberProfileFileDTO);
    }

    //  프로필 수정 텍스트 저장
    @Transactional
    @LogStatus
    public void update(MemberDTO memberDTO) {
        // 이름(닉네임), 자기소개, 생년월일만 갱신한다.
        // 이미지 교체 흐름은 컨트롤러에서 upload/save/delete 순서로 직접 조합한다.
        memberDAO.update(memberDTO);
    }

    //  현재 프로필 이미지 조회
    @LogStatusWithReturn
    public MemberProfileFileDTO getProfileFile(Long memberId) {
        return memberProfileFileDAO.findByMemberId(memberId);
    }

    //  현재 배너 이미지 조회
    @LogStatusWithReturn
    public MemberProfileFileDTO getBannerFile(Long memberId) {
        return memberProfileFileDAO.findBannerByMemberId(memberId);
    }

    //  프로필/배너 이미지 관계 및 파일 메타 삭제
    @Transactional
    @LogStatus
    public void deleteProfileFile(Long fileId) {
        // member_profile_file 관계와 tbl_file 메타는 항상 같이 지워야
        // 다음 조회에서 이미 삭제된 파일 id가 남지 않는다.
        memberProfileFileDAO.delete(fileId);
        fileDAO.delete(fileId);
    }

    //  이메일 검사(true : 사용가능)
    @LogStatusWithReturn
    public boolean checkEmail(String memberEmail){
        return memberDAO.findMemberByMemberEmail(memberEmail).isEmpty();
    }

    //  핸드폰 검사(true : 사용가능)
    @LogStatusWithReturn
    public boolean checkPhone(String memberPhone){
        return memberDAO.findMemberByMemberPhone(memberPhone).isEmpty();
    }

    // OAuth 가입 직후처럼 DB에 로컬 비밀번호가 아직 없는 계정은
    // setting에서 "현재 비밀번호 확인"을 강제할 수 없으므로 별도 타입으로 취급한다.
    private boolean isPasswordlessOauthMember(MemberDTO member) {
        return member.getProvider() != null &&
                (member.getMemberPassword() == null || member.getMemberPassword().isBlank());
    }

    // 현재 로그인한 사용자의 raw password가 DB의 encoded password와 일치하는지 검사한다.
    // 기존 "중복검사" 계열 메서드와 달리, 이 메서드는 인증 성공 여부를 그대로 true/false로 돌려준다.
    @LogStatusWithReturn
    public boolean checkPassword(String loginId, String memberPassword){
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        // provider 계정이 아직 비밀번호를 만들지 않았다면 재인증 단계는 통과시켜
        // 프런트가 계정 정보 화면으로 바로 들어갈 수 있게 한다.
        if (isPasswordlessOauthMember(member)) {
            return true;
        }

        return passwordEncoder.matches(memberPassword, member.getMemberPassword());
    }

    @Transactional
    @LogStatus
    public void updatePassword(String loginId, String currentPassword, String nextPassword) {
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        // passwordless provider 계정은 "변경"이 아니라 최초 비밀번호 생성에 가깝다.
        // 이 경우에만 현재 비밀번호 검증을 생략하고 새 비밀번호를 바로 저장한다.
        if (!isPasswordlessOauthMember(member) &&
                !passwordEncoder.matches(currentPassword, member.getMemberPassword())) {
            throw new IllegalArgumentException("현재 비밀번호를 다시 확인하세요.");
        }

        memberDAO.updatePassword(member.getId(), passwordEncoder.encode(nextPassword));
    }
    //  handle 검사(true : 사용가능)
    @LogStatusWithReturn
    public boolean checkHandle(String memberHandle){
        // DB에는 @가 포함된 형태로 저장되므로 조회 시에도 동일한 형태로 맞춘다.
        return memberDAO.findMemberByMemberHandle("@" + memberHandle).isEmpty();
    }

    //  업체명(상호명) 중복 검사 (true : 사용가능)
    @LogStatusWithReturn
    public boolean checkCompanyName(String companyName){
        return !businessMemberDAO.existsByCompanyName(companyName);
    }

    //  사업자 등록번호 중복 검사 (true : 사용가능)
    @LogStatusWithReturn
    public boolean checkBusinessNumber(String businessNumber){
        return !businessMemberDAO.existsByBusinessNumber(businessNumber);
    }

    @Transactional
    @CachePut(value="member", key="#loginId")
    @LogStatus
    public void updateHandle(String loginId, String memberHandle) {
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        // 입력창은 @ 없이 raw handle만 다루고, DB 저장 직전에만 프로젝트 저장 포맷으로 맞춘다.
        String normalizedHandle = memberHandle == null ? "" : memberHandle.trim().replaceFirst("^@+", "");

        if (normalizedHandle.isEmpty()) {
            throw new IllegalArgumentException("아이디를 입력하세요.");
        }

        if (!normalizedHandle.matches("^[a-z0-9_]{4,15}$")) {
            throw new IllegalArgumentException("영문 소문자, 숫자, 밑줄(_) 4~15자만 사용할 수 있습니다.");
        }

        String savedHandle = "@" + normalizedHandle;

        // 현재 본인 값과 같으면 중복이나 저장 오류로 보지 않고 그대로 통과시킨다.
        if (savedHandle.equals(member.getMemberHandle())) {
            return;
        }

        if (memberDAO.findMemberByMemberHandle(savedHandle).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        memberDAO.updateHandle(member.getId(), savedHandle);
    }

    @Transactional
    @CachePut(value="member", key="#loginId")
    @LogStatus
    public void updatePhone(String loginId, String memberPhone) {
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        // 전화번호 입력은 화면에서 하이픈이 섞일 수 있으므로 저장 전에 숫자만 남겨 정규화한다.
        String normalizedPhone = memberPhone == null ? "" : memberPhone.replaceAll("\\D", "");

        if (normalizedPhone.isEmpty()) {
            throw new IllegalArgumentException("휴대폰 번호를 입력하세요.");
        }

        if (!normalizedPhone.matches("^01[0-9]{8,9}$")) {
            throw new IllegalArgumentException("올바른 휴대폰 번호 형식을 확인하세요.");
        }

        if (normalizedPhone.equals(member.getMemberPhone())) {
            return;
        }

        if (memberDAO.findMemberByMemberPhone(normalizedPhone).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 휴대폰 번호입니다.");
        }

        memberDAO.updatePhone(member.getId(), normalizedPhone);
    }

    @Transactional
    @CachePut(value="member", key="#loginId")
    @LogStatus
    public void updateEmail(String loginId, String memberEmail) {
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        // 이메일 입력은 앞뒤 공백과 대소문자 차이로 같은 값이 중복 저장되지 않게 정규화한다.
        String normalizedEmail = memberEmail == null ? "" : memberEmail.trim().toLowerCase();

        if (normalizedEmail.isEmpty()) {
            throw new IllegalArgumentException("이메일을 입력하세요.");
        }

        if (!normalizedEmail.matches("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$")) {
            throw new IllegalArgumentException("올바른 이메일 형식을 확인하세요.");
        }

        if (normalizedEmail.equals(member.getMemberEmail())) {
            return;
        }

        if (memberDAO.findMemberByMemberEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        memberDAO.updateEmail(member.getId(), normalizedEmail);
    }

    // setting 언어 모달은 하드코딩된 선택지에서 단일 라벨 문자열만 넘어오는 구조다.
    // getMember(loginId)는 캐시를 사용하므로 저장 후에는 현재 사용자의 member 캐시를 비워
    // 다음 setting 진입이나 새로고침 시 최신 언어가 다시 내려오게 만든다.
    @Transactional
    @CachePut(value="member", key="#loginId")
    @LogStatus
    public void updateLanguage(String loginId, String memberLanguage) {
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        String normalizedLanguage = memberLanguage == null ? "" : memberLanguage.trim();

        if (normalizedLanguage.isEmpty()) {
            throw new IllegalArgumentException("언어를 선택하세요.");
        }

        if (normalizedLanguage.equals(member.getMemberLanguage())) {
            return;
        }

        memberDAO.updateLanguage(member.getId(), normalizedLanguage);
    }

    // setting의 국가 선택은 단일 라벨 문자열만 넘어오는 구조다.
    // memberRegion은 주소용으로 이미 쓰고 있으므로 국가 저장은 member_country만 별도로 갱신한다.
    @Transactional
    @CachePut(value = "member", key = "#loginId")
    @LogStatus
    public void updateCountry(String loginId, String memberCountry) {
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        String normalizedCountry = memberCountry == null ? "" : memberCountry.trim();

        if (normalizedCountry.isEmpty()) {
            throw new IllegalArgumentException("국가를 선택하세요.");
        }

        if (normalizedCountry.equals(member.getMemberCountry())) {
            return;
        }

        memberDAO.updateCountry(member.getId(), normalizedCountry);
    }

    // 푸시 master on/off는 "전체 preset" 역할을 한다.
    // 따라서 master를 켜면 상세 push도 전부 true, 끄면 상세 push도 전부 false로 함께 맞춘다.
    // void 반환 메서드에서는 CachePut보다 CacheEvict가 안전하므로 다음 조회에서 최신 member를 다시 읽게 만든다.
    @Transactional
    @CacheEvict(value="member", key="#loginId")
    @LogStatus
    public void updatePushEnabled(String loginId, boolean pushEnabled) {
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        memberDAO.updatePushEnabled(member.getId(), pushEnabled);

        NotificationPreferenceDTO current = notificationPreferenceDAO.findByMemberId(member.getId())
                .orElseGet(() -> createDefaultNotificationPreference(member));

        current.setPushConnect(pushEnabled);
        current.setPushExpert(pushEnabled);
        current.setPushLikes(pushEnabled);
        current.setPushPosts(pushEnabled);
        current.setPushComments(pushEnabled);
        current.setPushChatMessages(pushEnabled);
        current.setPushQuotes(pushEnabled);
        current.setPushSystem(pushEnabled);
        current.setPushMentions(pushEnabled);

        notificationPreferenceDAO.save(current);
    }

    @LogStatusWithReturn
    public NotificationPreferenceDTO getNotificationPreference(String loginId) {
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        return notificationPreferenceDAO.findByMemberId(member.getId())
                .orElseGet(() -> createDefaultNotificationPreference(member));
    }

    // 회원가입(join) 단계에서 이미 pushEnabled=true/false가 저장되므로,
    // 상세 푸시 알림 기본값은 그 선택을 그대로 따라간다.
    private NotificationPreferenceDTO createDefaultNotificationPreference(MemberDTO member) {
        boolean pushEnabled = member.isPushEnabled();

        NotificationPreferenceDTO dto = new NotificationPreferenceDTO();
        dto.setMemberId(member.getId());

        dto.setPushConnect(pushEnabled);
        dto.setPushExpert(pushEnabled);
        dto.setPushLikes(pushEnabled);
        dto.setPushPosts(pushEnabled);
        dto.setPushComments(pushEnabled);
        dto.setPushChatMessages(pushEnabled);
        dto.setPushQuotes(pushEnabled);
        dto.setPushSystem(pushEnabled);
        dto.setPushMentions(pushEnabled);

        return dto;
    }

    @Transactional
    @CacheEvict(value="member", key="#loginId")
    @LogStatus
    public void updateNotificationPushPreference(String loginId, NotificationPreferenceDTO request) {
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        NotificationPreferenceDTO current = notificationPreferenceDAO.findByMemberId(member.getId())
                .orElseGet(() -> createDefaultNotificationPreference(member));

        // push 상세 저장은 푸시 체크 관련 필드만 바꿔
        // 필터/뮤트 조건이 섹션 간 저장 때문에 사라지지 않게 만든다.
        current.setPushConnect(request.isPushConnect());
        current.setPushExpert(request.isPushExpert());
        current.setPushLikes(request.isPushLikes());
        current.setPushPosts(request.isPushPosts());
        current.setPushComments(request.isPushComments());
        current.setPushChatMessages(request.isPushChatMessages());
        current.setPushQuotes(request.isPushQuotes());
        current.setPushSystem(request.isPushSystem());
        current.setPushMentions(request.isPushMentions());

        // 상세 push 저장은 개별 체크 상태를 그대로 반영하되,
        // 최종적으로 하나도 선택되지 않으면 master push_enabled도 false로 맞춘다.
        boolean hasEnabledPushAlert =
                current.isPushConnect()
                        || current.isPushExpert()
                        || current.isPushLikes()
                        || current.isPushPosts()
                        || current.isPushComments()
                        || current.isPushChatMessages()
                        || current.isPushQuotes()
                        || current.isPushSystem()
                        || current.isPushMentions();

        memberDAO.updatePushEnabled(member.getId(), hasEnabledPushAlert);
        notificationPreferenceDAO.save(current);
    }

    // 계정 비활성화는 현재 로그인 사용자의 비밀번호를 다시 확인한 뒤 soft delete로 처리한다.
    // getMember/login 계열이 member 캐시를 사용할 수 있으므로 비활성화 후에는 캐시도 함께 비운다.
    @Transactional
    @CacheEvict(value="member", key="#loginId")
    @LogStatus
    public void deactivateMember(String loginId, String memberPassword) {
        MemberDTO member = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(MemberNotFoundException::new);

        // passwordless provider 계정은 확인용 비밀번호 자체가 없으므로
        // 최소 리스크 버전에서는 추가 입력 없이 비활성화를 허용한다.
        if (isPasswordlessOauthMember(member)) {
            memberDAO.softDelete(member.getId());
            return;
        }

        String normalizedPassword = memberPassword == null ? "" : memberPassword.trim();

        if (normalizedPassword.isEmpty()) {
            throw new IllegalArgumentException("비밀번호를 입력하세요.");
        }

        if (!passwordEncoder.matches(normalizedPassword, member.getMemberPassword())) {
            throw new IllegalArgumentException("비밀번호를 다시 확인하세요.");
        }

        memberDAO.softDelete(member.getId());
    }

    // 재활성화는 active 조회를 쓰지 않고, 상태와 무관한 로그인 식별값 조회로 시작해야 한다.
    // 그래야 inactive 회원을 일반 로그인과 분리해서 별도 복구 흐름으로 보낼 수 있다.
    @LogStatusWithReturn
    public MemberDTO getInactiveMemberForReactivation(String loginId, String memberPassword) {
        MemberDTO member = memberDAO.findMemberByLoginIdAnyStatus(loginId)
                .orElseThrow(() -> new IllegalArgumentException("입력한 정보가 일치하지 않습니다."));

        if (member.getMemberStatus() != Status.INACTIVE) {
            throw new IllegalArgumentException("재활성화 가능한 계정을 찾지 못했습니다.");
        }

        if (!passwordEncoder.matches(memberPassword, member.getMemberPassword())) {
            throw new IllegalArgumentException("입력한 정보가 일치하지 않습니다.");
        }

        return member;
    }

    @LogStatusWithReturn
    public String getMaskedReactivationTarget(String loginId, MemberDTO member) {
        // 재활성화 안내 화면은 실제 연락처 전체를 보여줄 필요가 없으므로
        // 로그인에 사용한 식별자 채널만 남기고 마스킹된 문자열로 내려준다.
        if (loginId != null && loginId.contains("@")) {
            String email = member.getMemberEmail();

            if (email == null || !email.contains("@")) {
                return "가입된 이메일";
            }

            String[] parts = email.split("@", 2);
            String local = parts[0];

            if (local.length() <= 2) {
                return local.charAt(0) + "*@" + parts[1];
            }

            return local.substring(0, 2)
                    + "*".repeat(local.length() - 2)
                    + "@"
                    + parts[1];
        }

        String phone = member.getMemberPhone();

        if (phone == null || phone.length() < 8) {
            return "가입된 휴대폰 번호";
        }

        return phone.substring(0, 3) + "-****-" + phone.substring(phone.length() - 4);
    }

    // inactive 계정 복구는 상태만 active로 되돌리면 되고,
    // 이후 인증/토큰 발급은 기존 로그인과 같은 보안 흐름을 컨트롤러가 이어서 마무리한다.
    @Transactional
    @CacheEvict(value="member", key="#loginId")
    @LogStatus
    public void reactivateMember(String loginId, String memberPassword) {
        MemberDTO member = getInactiveMemberForReactivation(loginId, memberPassword);
        memberDAO.reactivate(member.getId());
    }

    //    로그인
    @Transactional
    @LogStatusWithReturn
    public MemberDTO login(MemberDTO memberDTO){
        return memberDAO.findMemberForLogin(memberDTO.toMemberVO()).orElseThrow(MemberLoginFailException::new);
    }

    //    회원정보 조회
    @Cacheable(value="member", key="#loginId")
    @LogStatusWithReturn
    public MemberDTO getMember(String loginId){
        return memberDAO.findMemberByLoginId(loginId).orElseThrow(MemberNotFoundException::new);
    }

    // 마이페이지의 상대 프로필 조회는 로그인 식별값이 아니라 회원 id로 바로 조회한다.
    // 1차는 화면 분기만 필요하므로 별도 DTO 가공 없이 기존 member 조회를 그대로 재사용한다.
    @LogStatusWithReturn
    public MemberDTO getMemberById(Long memberId) {
        return memberDAO.findByMemberId(memberId).orElseThrow(MemberNotFoundException::new);
    }

    // 검색 값에 따른 회원들 조회
    @Cacheable(value="member", key="'page:' + #page + ':keyword:' + #keyword + ':memberId:' + #memberId")
    @LogStatusWithReturn
    public MemberWithPagingDTO getSearchMember(int page, Long memberId, String keyword) {
        MemberWithPagingDTO memberWithPagingDTO = new MemberWithPagingDTO();
        Criteria criteria = new Criteria(page, memberDAO.findTotalByKeyword(keyword));

        List<MemberDTO> members = memberDAO.findMembersByKeywordWithFollow(memberId, keyword, criteria).stream()
                .map(memberDTO -> {
                    MemberProfileFileDTO profile = memberProfileFileDAO.findByMemberId(memberDTO.getId());
                    if(profile != null) {
                        memberDTO.setProfileURL(profile.getFilePath());
                    }
                    return memberDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(members.size() > criteria.getRowCount());
        memberWithPagingDTO.setCriteria(criteria);

        memberWithPagingDTO.setMembers(members);

        return memberWithPagingDTO;
    }

    // 전문가 페이지 - 거래처 등록 목록 조회
    @Cacheable(value="inquiry:member", key="'page:' + #page" + " + ':categoryName:' + #categoryName" + " + ':memberId:' + #memberId")
    @LogStatusWithReturn
    public InquiryMemberWithPagingDTO getInquiryMembers (int page, String categoryName, Long memberId) {
        InquiryMemberWithPagingDTO inquiryMemberWithPagingDTO = new InquiryMemberWithPagingDTO();
        Criteria criteria = new Criteria(page, memberDAO.findInquiryTotal(categoryName, memberId));

        List<InquiryMemberDTO> members = memberDAO.findInquiryMembers(criteria, categoryName, memberId).stream()
                .map(memberDTO -> {
                    MemberProfileFileDTO profile = memberProfileFileDAO.findByMemberId(memberDTO.getId());
                    if(profile != null) {
                        memberDTO.setFilePath(profile.getFilePath());
                    }
                    return memberDTO;
                }).collect(Collectors.toList());
        criteria.setHasMore(members.size() > criteria.getRowCount());
        inquiryMemberWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            members.remove(members.size() - 1);
        }

        inquiryMemberWithPagingDTO.setMembers(members);

        return inquiryMemberWithPagingDTO;
    }

    // 프로필 이미지 삭제
    @LogStatus
    public void delete(Long id) {
        MemberProfileFileDTO file = memberProfileFileDAO.findByMemberId(id);
        memberProfileFileDAO.deleteByMemberId(id);
        memberDAO.softDelete(id);
    }

    // 오늘자 경로 생성
    public String getTodayPath(){
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }


}
