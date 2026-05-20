package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.AdStatus;
import com.app.globalgates.common.enumeration.BadgeType;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(BadgeType.class)
public class BadgeTypeHandler implements TypeHandler<BadgeType> {
    @Override
    public void setParameter(PreparedStatement ps, int i, BadgeType parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public BadgeType getResult(ResultSet rs, String columnName) throws SQLException {
        return switch (rs.getString(columnName)) {
            case "pro" -> BadgeType.PRO;
            case "pro_plus" -> BadgeType.PRO_PLUS;
            case "expired" -> BadgeType.EXPERT;
            default -> null;
        };
    }

    @Override
    public BadgeType getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "pro" -> BadgeType.PRO;
            case "pro_plus" -> BadgeType.PRO_PLUS;
            case "expired" -> BadgeType.EXPERT;
            default -> null;
        };
    }

    @Override
    public BadgeType getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "pro" -> BadgeType.PRO;
            case "pro_plus" -> BadgeType.PRO_PLUS;
            case "expired" -> BadgeType.EXPERT;
            default -> null;
        };
    }
}
