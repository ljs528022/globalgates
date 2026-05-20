DO $$
DECLARE
    ad          RECORD;
    new_file_id BIGINT;
    ct          file_content_type;
    ext         TEXT;
    fsize       BIGINT;
BEGIN
    FOR ad IN
        SELECT id FROM tbl_advertisement ORDER BY id
    LOOP
          -- 40% image, 60% video
        IF random() < 0.4 THEN
            ct    := 'image';
            ext   := '.jpg';
            fsize := 524288;       -- 0.5MB placeholder
        ELSE
            ct    := 'video';
            ext   := '.mp4';
            fsize := 5242880;      -- 5MB placeholder
        END IF;

        -- 1) tbl_file INSERT
        INSERT INTO tbl_file (original_name, file_name, file_path, file_size, content_type)
        VALUES (
                   'ad_' || ad.id || ext,
                   'dummy_ad_' || ad.id || ext,
                   '/dummy/ads/' || ad.id || ext,
                   fsize,
                   ct
               )
        RETURNING id INTO new_file_id;

        -- 2) tbl_ad_file 매핑 INSERT
        INSERT INTO tbl_ad_file (id, ad_id)
        VALUES (new_file_id, ad.id);
    END LOOP;
END $$;

-- 결과 검증 쿼리
-- 광고 7000건 모두 파일 1개씩 매핑됐는지
SELECT COUNT(*) AS total_ads,
     COUNT(DISTINCT af.ad_id) AS ads_with_file
FROM tbl_advertisement a
LEFT JOIN tbl_ad_file af ON a.id = af.ad_id;
-- → total_ads = ads_with_file 이어야 함

-- image:video 비율 확인 (40:60 근처여야 함)
SELECT f.content_type, COUNT(*) AS cnt
FROM tbl_advertisement a
JOIN tbl_ad_file af ON a.id = af.ad_id
JOIN tbl_file f ON af.id = f.id
GROUP BY f.content_type;
-- → image ≈ 2800, video ≈ 4200

UPDATE tbl_advertisement
SET budget = (50000 * power(10, random() * 2))::int::numeric
WHERE budget = 0;