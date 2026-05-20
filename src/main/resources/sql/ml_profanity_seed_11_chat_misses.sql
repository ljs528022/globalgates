-- ml_profanity_seed part 11 (chat miss cases)
-- 실제 채팅 테스트에서 분류기가 놓친 사례를 학습 데이터에 보강한다.
-- 카테고리:
--   1) 영어 직접 욕설 / 잘림 변형
--   2) 영어 모욕 phrase (your mother, your father 류)
--   3) 한국어 늘림/변형 (병신 → 븨이이이잉신)
--   4) 한국어 약한 모욕 (바보, 모자란 놈, 너같은 ~ ㅉㅉ)
--   5) 일반 명사 단독은 'clean'으로 대조 라벨링하여 false positive 방지

insert into tbl_ml_profanity_dataset (content, target) values
  -- 1) 영어 직접 욕설
  ('sex', 'abusive'),
  ('fuck', 'abusive'),
  ('fucker', 'abusive'),
  ('fucking', 'abusive'),
  ('motherfucker', 'abusive'),
  ('mofucker', 'abusive'),
  ('mothafucker', 'abusive'),
  ('shit', 'abusive'),
  ('bitch', 'abusive'),
  ('asshole', 'abusive'),
  ('bastard', 'abusive'),
  ('dick', 'abusive'),
  ('cunt', 'abusive'),
  ('go to hell', 'abusive'),
  ('fuck you', 'abusive'),
  ('shut up bitch', 'abusive'),

  -- 2) 영어 모욕 phrase
  ('your mother', 'abusive'),
  ('your father', 'abusive'),
  ('yo mama', 'abusive'),
  ('yo momma', 'abusive'),
  ('yout father', 'abusive'),
  ('your mom', 'abusive'),
  ('your dad', 'abusive'),
  ('fuck your mother', 'abusive'),

  -- 3) 한국어 늘림/변형
  ('븨이이이이이잉신', 'abusive'),
  ('비이이잉신', 'abusive'),
  ('병시이이이인', 'abusive'),
  ('병~~신', 'abusive'),
  ('븅신', 'abusive'),
  ('븅~신', 'abusive'),
  ('미치인놈', 'abusive'),
  ('미친놈', 'abusive'),
  ('미친새끼', 'abusive'),
  ('씨이이발', 'abusive'),
  ('씨이바알', 'abusive'),
  ('씨바라', 'abusive'),

  -- 4) 한국어 약한 모욕/비하
  ('너 정말 바보야', 'abusive'),
  ('진짜 바보같다', 'abusive'),
  ('바보놈', 'abusive'),
  ('바보 같은 소리', 'abusive'),
  ('너 멍청이야', 'abusive'),
  ('등신같은 짓 하지마', 'abusive'),
  ('너같은 모자란 놈은 처음본다', 'abusive'),
  ('모자란 놈', 'abusive'),
  ('너같은 놈은 처음본다 ㅉㅉ', 'abusive'),
  ('찌질한 놈', 'abusive'),
  ('쓰레기같은 인간', 'abusive'),
  ('한심한 놈', 'abusive'),
  ('수준 떨어진다 ㅉㅉ', 'abusive'),
  ('너 정말 한심하다', 'abusive'),
  ('정신 좀 차려라', 'abusive'),

  -- 5) 정상 문맥 대조 (일반 명사 단독은 욕이 아님 — false positive 방지)
  ('mother는 어머니라는 뜻이에요', 'clean'),
  ('father는 아버지라는 뜻이에요', 'clean'),
  ('my mother is a teacher', 'clean'),
  ('I love my father', 'clean'),
  ('mothers day는 5월입니다', 'clean'),
  ('father day는 6월입니다', 'clean'),
  ('어머니께 선물을 드렸어요', 'clean'),
  ('아버지가 오늘 일찍 들어오신다고 합니다', 'clean'),
  ('바보 캐릭터가 귀여워요', 'clean'),
  ('단어 sex는 성별을 의미합니다', 'clean'),
  ('your name is what?', 'clean'),
  ('your project is amazing', 'clean')
;
