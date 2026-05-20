package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.NotificationType;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(NotificationType.class)
public class NotificationTypeHandler implements TypeHandler<NotificationType> {
    @Override
    public void setParameter(PreparedStatement ps, int i, NotificationType parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public NotificationType getResult(ResultSet rs, int columnIndex) throws SQLException {
        return NotificationType.getNotificationType(rs.getString(columnIndex));
    }

    @Override
    public NotificationType getResult(ResultSet rs, String columnName) throws SQLException {
        return NotificationType.getNotificationType(rs.getString(columnName));
    }

    @Override
    public NotificationType getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return NotificationType.getNotificationType(cs.getString(columnIndex));
    }
}
