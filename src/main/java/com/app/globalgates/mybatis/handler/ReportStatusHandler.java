package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.AdStatus;
import com.app.globalgates.common.enumeration.ReportStatus;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(ReportStatus.class)
public class ReportStatusHandler implements TypeHandler<ReportStatus> {
    @Override
    public void setParameter(PreparedStatement ps, int i, ReportStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public ReportStatus getResult(ResultSet rs, String columnName) throws SQLException {
        return switch (rs.getString(columnName)) {
            case "pending" -> ReportStatus.PENDING;
            case "applied" -> ReportStatus.APPLIED;
            case "rejected" -> ReportStatus.REJECTED;
            default -> null;
        };
    }

    @Override
    public ReportStatus getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "pending" -> ReportStatus.PENDING;
            case "applied" -> ReportStatus.APPLIED;
            case "rejected" -> ReportStatus.REJECTED;
            default -> null;
        };
    }

    @Override
    public ReportStatus getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "pending" -> ReportStatus.PENDING;
            case "applied" -> ReportStatus.APPLIED;
            case "rejected" -> ReportStatus.REJECTED;
            default -> null;
        };
    }
}
