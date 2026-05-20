package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.PaymentStatus;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(PaymentStatus.class)
public class PaymentStatusHandler implements TypeHandler<PaymentStatus> {
    @Override
    public void setParameter(PreparedStatement ps, int i, PaymentStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public PaymentStatus getResult(ResultSet rs, String columnName) throws SQLException {
        return switch (rs.getString(columnName)) {
            case "pending" -> PaymentStatus.PENDING;
            case "completed" -> PaymentStatus.COMPLETED;
            case "cancelled" -> PaymentStatus.CANCELLED;
            case "failed" -> PaymentStatus.FAILED;
            default -> null;
        };
    }

    @Override
    public PaymentStatus getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "pending" -> PaymentStatus.PENDING;
            case "completed" -> PaymentStatus.COMPLETED;
            case "cancelled" -> PaymentStatus.CANCELLED;
            case "failed" -> PaymentStatus.FAILED;
            default -> null;
        };
    }

    @Override
    public PaymentStatus getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "pending" -> PaymentStatus.PENDING;
            case "completed" -> PaymentStatus.COMPLETED;
            case "cancelled" -> PaymentStatus.CANCELLED;
            case "failed" -> PaymentStatus.FAILED;
            default -> null;
        };
    }
}
