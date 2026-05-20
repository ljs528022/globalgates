package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.SubscriptionStatus;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(SubscriptionStatus.class)
public class SubscriptionStatusHandler implements TypeHandler<SubscriptionStatus> {
    @Override
    public void setParameter(PreparedStatement ps, int i, SubscriptionStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public SubscriptionStatus getResult(ResultSet rs, String columnName) throws SQLException {
        return SubscriptionStatus.getSubscriptionStatus(rs.getString(columnName));
    }

    @Override
    public SubscriptionStatus getResult(ResultSet rs, int columnIndex) throws SQLException {
        return SubscriptionStatus.getSubscriptionStatus(rs.getString(columnIndex));
    }

    @Override
    public SubscriptionStatus getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return SubscriptionStatus.getSubscriptionStatus(cs.getString(columnIndex));
    }
}
