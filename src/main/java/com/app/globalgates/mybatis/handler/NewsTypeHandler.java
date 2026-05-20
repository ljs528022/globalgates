package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.NewsType;
import com.app.globalgates.common.enumeration.PaymentStatus;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(NewsType.class)
public class NewsTypeHandler implements TypeHandler<NewsType> {
    @Override
    public void setParameter(PreparedStatement ps, int i, NewsType parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public NewsType getResult(ResultSet rs, String columnName) throws SQLException {
        return switch (rs.getString(columnName)) {
            case "general" -> NewsType.GENERAL;
            case "emergency" -> NewsType.EMERGENCY;
            default -> null;
        };
    }

    @Override
    public NewsType getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "general" -> NewsType.GENERAL;
            case "emergency" -> NewsType.EMERGENCY;
            default -> null;
        };
    }

    @Override
    public NewsType getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "general" -> NewsType.GENERAL;
            case "emergency" -> NewsType.EMERGENCY;
            default -> null;
        };
    }
}
