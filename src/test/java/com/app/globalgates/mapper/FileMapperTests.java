package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.domain.FileVO;
import com.app.globalgates.dto.FileDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.annotation.Commit;

import java.util.Optional;

@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Commit
@Slf4j
public class FileMapperTests {
    @Autowired
    private FileMapper fileMapper;

    @Autowired
    private FileAdvertisementMapper fileAdvertisementMapper;


    @Test
    public void testInsertAdvertisementImage() {
        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName("TEST");
        fileDTO.setFileName("TEST_IMAGE");
        fileDTO.setFilePath("/2026/30/18");
        fileDTO.setFileSize(300L);
        fileDTO.setContentType(FileContentType.IMAGE);

        fileMapper.insert(fileDTO);
    }

    @Test
    public void testSelectById() {
        Optional<FileVO> foundFile = fileMapper.selectById(2L);
        log.info("{}....", foundFile);
    }

    @Test
    public void testDelete() {
        fileMapper.delete(2L);
    }
}

