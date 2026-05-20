package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.AdStatus;
import com.app.globalgates.common.enumeration.ReportTargetType;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(ReportTargetType.class)
public class ReportTargetTypeHandler implements TypeHandler<ReportTargetType> {
    @Override
    public void setParameter(PreparedStatement ps, int i, ReportTargetType parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public ReportTargetType getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "post" -> ReportTargetType.POST;
            case "member" -> ReportTargetType.MEMBER;
            default -> null;
        };
    }

    @Override
    public ReportTargetType getResult(ResultSet rs, String columnName) throws SQLException {
        return switch (rs.getString(columnName)) {
            case "post" -> ReportTargetType.POST;
            case "member" -> ReportTargetType.MEMBER;
            default -> null;
        };
    }

    @Override
    public ReportTargetType getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "post" -> ReportTargetType.POST;
            case "member" -> ReportTargetType.MEMBER;
            default -> null;
        };
    }
}
