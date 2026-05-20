package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.ExpertDTO;
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
public class ExpertMapperTests {
    @Autowired
    private ExpertMapper expertMapper;

    @Test
    public void testSelectAll() {
        Criteria criteria = new Criteria(1, expertMapper.selectTotal());
        List<ExpertDTO> experts = expertMapper.selectAll(criteria, 1L);
        experts.forEach(expert -> log.info("전문가: {}", expert));
    }

    @Test
    public void testSelectTotal() {
        int total = expertMapper.selectTotal();
        log.info("전문가 몇명: {}", total);
    }
}
