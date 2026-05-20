package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.SubscriptionTier;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(SubscriptionTier.class)
public class SubscriptionTierHandler implements TypeHandler<SubscriptionTier> {
    @Override
    public void setParameter(PreparedStatement ps, int i, SubscriptionTier parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public SubscriptionTier getResult(ResultSet rs, String columnName) throws SQLException {
        return SubscriptionTier.getSubscriptionTier(rs.getString(columnName));
    }

    @Override
    public SubscriptionTier getResult(ResultSet rs, int columnIndex) throws SQLException {
        return SubscriptionTier.getSubscriptionTier(rs.getString(columnIndex));
    }

    @Override
    public SubscriptionTier getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return SubscriptionTier.getSubscriptionTier(cs.getString(columnIndex));
    }
}
