package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.OAuthProvider;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(OAuthProvider.class)
public class OAuthProviderHandler implements TypeHandler<OAuthProvider> {
    @Override
    public void setParameter(PreparedStatement ps, int i, OAuthProvider parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public OAuthProvider getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "kakao" -> OAuthProvider.KAKAO;
            case "naver" -> OAuthProvider.NAVER;
            case "google" -> OAuthProvider.GOOGLE;
            case "facebook" -> OAuthProvider.FACEBOOK;
            default -> null;
        };
    }

    @Override
    public OAuthProvider getResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        if(value == null) return null;

        return switch (value.toLowerCase()) {
            case "kakao" -> OAuthProvider.KAKAO;
            case "naver" -> OAuthProvider.NAVER;
            case "google" -> OAuthProvider.GOOGLE;
            case "facebook" -> OAuthProvider.FACEBOOK;
            default -> null;
        };
    }

    @Override
    public OAuthProvider getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "kakao" -> OAuthProvider.KAKAO;
            case "naver" -> OAuthProvider.NAVER;
            case "google" -> OAuthProvider.GOOGLE;
            case "facebook" -> OAuthProvider.FACEBOOK;
            default -> null;
        };
    }
}
