name: Backend Issue
description: 백엔드 작업 이슈 템플릿
title: "[BE] "
labels:
  - backend
body:
  - type: dropdown
    id: feature_group
    attributes:
      label: 기능 영역
      description: 해당 이슈가 속한 기능을 선택해주세요.
      multiple: true
      options:
        - 로그인
        - 회원가입
        - 마이 페이지
        - 개인정보 세팅
        - 북마크
        - 뉴스
        - 리스트
        - 커뮤니티
        - 채팅
        - 검색
        - 광고
        - 화상 채팅
        - 거래처
        - 알림
        - 메인 페이지
        - 친구
        - 구독 관리자
        - 전문가
        - 견적
        - 집계 차트
    validations:
      required: true

  - type: textarea
    id: overview
    attributes:
      label: 개요
      description: 어떤 작업인지 간단히 설명해주세요.
      placeholder: 회원 프로필 조회 API 응답 필드 추가
    validations:
      required: true

  - type: textarea
    id: purpose
    attributes:
      label: 목적
      description: 왜 필요한 작업인지 작성해주세요.
      placeholder: 프론트 요구사항 반영
    validations:
      required: true

  - type: textarea
    id: background
    attributes:
      label: 배경 / 문제 상황
      description: 현재 상황 또는 문제를 설명해주세요.
      placeholder: 기존 API 응답값으로는 화면 요구사항을 만족할 수 없음

  - type: checkboxes
    id: scope
    attributes:
      label: 작업 범위
      options:
        - label: API 개발
        - label: API 수정
        - label: Service 로직 구현
        - label: Repository / Query 수정
        - label: DB 스키마 변경
        - label: Validation 추가
        - label: 예외 처리
        - label: 테스트 코드 작성
        - label: 성능 개선
        - label: 리팩토링
        - label: 문서화

  - type: textarea
    id: detail
    attributes:
      label: 상세 작업 내용
      description: 구현해야 할 내용을 구체적으로 작성해주세요.
      placeholder: |
        - Endpoint:
        - 변경 사항:
        - 비즈니스 로직:

  - type: textarea
    id: api_spec
    attributes:
      label: 요청 / 응답 스펙
      description: API 요청/응답 예시를 작성해주세요.
      placeholder: |
        Request
        {
          "id": 1
        }

        Response
        {
          "id": 1,
          "name": "홍길동"
        }

  - type: textarea
    id: exception
    attributes:
      label: 예외 사항
      description: 예상되는 예외 케이스를 작성해주세요.
      placeholder: 사용자가 존재하지 않는 경우, 권한이 없는 경우 등

  - type: dropdown
    id: db_impact
    attributes:
      label: DB 영향도
      description: DB 변경 여부를 선택해주세요.
      options:
        - 없음
        - 있음
    validations:
      required: true

  - type: textarea
    id: db_detail
    attributes:
      label: DB 변경 내용
      description: 테이블, 컬럼, 인덱스 변경 사항이 있다면 작성해주세요.
      placeholder: users 테이블에 profile_image_url 컬럼 추가

  - type: checkboxes
    id: test_cases
    attributes:
      label: 테스트 케이스
      options:
        - label: 정상 케이스
        - label: 예외 케이스
        - label: 권한 관련 케이스
        - label: 데이터 무결성 검증
        - label: 응답 스펙 검증

  - type: textarea
    id: acceptance
    attributes:
      label: 완료 조건 (Acceptance Criteria)
      description: 이슈 완료 기준을 작성해주세요.
      placeholder: |
        - 요구사항 충족
        - 테스트 통과
        - 문서 업데이트 완료

  - type: textarea
    id: reference
    attributes:
      label: 참고 사항
      description: 관련 문서, 이슈, 링크 등을 작성해주세요.
      placeholder: 관련 이슈 번호 / API 문서 / 기획 문서 링크
