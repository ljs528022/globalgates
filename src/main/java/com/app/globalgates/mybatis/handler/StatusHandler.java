package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.Status;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(Status.class)
public class StatusHandler implements TypeHandler<Status> {
    @Override
    public void setParameter(PreparedStatement ps, int i, Status parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public Status getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "active" -> Status.ACTIVE;
            case "inactive" -> Status.INACTIVE;
            case "banned" -> Status.BANNED;
            default -> null;
        };
    }

    @Override
    public Status getResult(ResultSet rs, String columnName) throws SQLException {
        return switch (rs.getString(columnName)) {
            case "active" -> Status.ACTIVE;
            case "inactive" -> Status.INACTIVE;
            case "banned" -> Status.BANNED;
            default -> null;
        };
    }

    @Override
    public Status getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "active" -> Status.ACTIVE;
            case "inactive" -> Status.INACTIVE;
            case "banned" -> Status.BANNED;
            default -> null;
        };
    }
}