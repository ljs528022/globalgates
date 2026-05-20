package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.AdStatus;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(AdStatus.class)
public class AdStatusHandler implements TypeHandler<AdStatus> {
    @Override
    public void setParameter(PreparedStatement ps, int i, AdStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public AdStatus getResult(ResultSet rs, String columnName) throws SQLException {
        return switch (rs.getString(columnName)) {
            case "active" -> AdStatus.ACTIVE;
            case "reported" -> AdStatus.REPORTED;
            case "expired" -> AdStatus.EXPIRED;
            default -> null;
        };
    }

    @Override
    public AdStatus getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "active" -> AdStatus.ACTIVE;
            case "reported" -> AdStatus.REPORTED;
            case "expired" -> AdStatus.EXPIRED;
            default -> null;
        };
    }

    @Override
    public AdStatus getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "active" -> AdStatus.ACTIVE;
            case "reported" -> AdStatus.REPORTED;
            case "expired" -> AdStatus.EXPIRED;
            default -> null;
        };
    }
}