package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.NewsCategoryType;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(NewsCategoryType.class)
public class NewsCategoryTypeHandler implements TypeHandler<NewsCategoryType> {
    @Override
    public void setParameter(PreparedStatement ps, int i, NewsCategoryType parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public NewsCategoryType getResult(ResultSet rs, String columnName) throws SQLException {
        return NewsCategoryType.getNewsCategoryType(rs.getString(columnName));
    }

    @Override
    public NewsCategoryType getResult(ResultSet rs, int columnIndex) throws SQLException {
        return NewsCategoryType.getNewsCategoryType(rs.getString(columnIndex));
    }

    @Override
    public NewsCategoryType getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return NewsCategoryType.getNewsCategoryType(cs.getString(columnIndex));
    }
}
