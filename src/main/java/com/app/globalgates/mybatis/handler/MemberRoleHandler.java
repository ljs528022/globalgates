package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.MemberRole;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(MemberRole.class)
public class MemberRoleHandler implements TypeHandler<MemberRole> {
    @Override
    public void setParameter(PreparedStatement ps, int i, MemberRole parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public MemberRole getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "business" -> MemberRole.BUSINESS;
            case "expert" -> MemberRole.EXPERT;
            case "admin" -> MemberRole.ADMIN;
            default -> null;
        };
    }

    @Override
    public MemberRole getResult(ResultSet rs, String columnName) throws SQLException {
        return switch (rs.getString(columnName)) {
            case "business" -> MemberRole.BUSINESS;
            case "expert" -> MemberRole.EXPERT;
            case "admin" -> MemberRole.ADMIN;
            default -> null;
        };
    }

    @Override
    public MemberRole getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "business" -> MemberRole.BUSINESS;
            case "expert" -> MemberRole.EXPERT;
            case "admin" -> MemberRole.ADMIN;
            default -> null;
        };
    }
}