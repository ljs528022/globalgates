package com.app.globalgates.mapper;

import com.app.globalgates.dto.FileAdvertisementDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.annotation.Commit;

import java.util.List;

@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Commit
@Slf4j
public class FileAdvertisementMapperTests {
    @Autowired
    private FileAdvertisementMapper fileAdvertisementMapper;

    @Test
    public void testInsert() {
        FileAdvertisementDTO fileAdDTO = new FileAdvertisementDTO();
        fileAdDTO.setId(3L);
        fileAdDTO.setAdId(6L);

        fileAdvertisementMapper.insert(fileAdDTO.toFileAdVO());
    }

    @Test
    public void testSelectByAdId() {
        List<FileAdvertisementDTO> foundImages = fileAdvertisementMapper.selectById(6L);
        log.info("조회한 광고 이미지 : {}", foundImages);
    }

    @Test
    public void testDelete() {
        fileAdvertisementMapper.delete(3L);
    }


}
