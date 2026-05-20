package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.ProfileImageType;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(ProfileImageType.class)
public class ProfileImageTypeHandler implements TypeHandler<ProfileImageType> {
    @Override
    public void setParameter(PreparedStatement ps, int i, ProfileImageType parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public ProfileImageType getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "profile" -> ProfileImageType.PROFILE;
            case "banner" -> ProfileImageType.BANNER;
            default -> null;
        };
    }

    @Override
    public ProfileImageType getResult(ResultSet rs, String columnName) throws SQLException {
        return switch (rs.getString(columnName)) {
            case "profile" -> ProfileImageType.PROFILE;
            case "banner" -> ProfileImageType.BANNER;
            default -> null;
        };
    }

    @Override
    public ProfileImageType getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "profile" -> ProfileImageType.PROFILE;
            case "banner" -> ProfileImageType.BANNER;
            default -> null;
        };
    }
}
