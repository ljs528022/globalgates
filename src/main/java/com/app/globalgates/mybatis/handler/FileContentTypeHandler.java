
package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.AdStatus;
import com.app.globalgates.common.enumeration.FileContentType;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(FileContentType.class)
public class FileContentTypeHandler implements TypeHandler<FileContentType> {

    @Override
    public void setParameter(PreparedStatement ps, int i, FileContentType parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public FileContentType getResult(ResultSet rs, String columnName) throws SQLException {
        return switch (rs.getString(columnName)) {
            case "image" -> FileContentType.IMAGE;
            case "video" -> FileContentType.VIDEO;
            case "document" -> FileContentType.DOCUMENT;
            case "etc" -> FileContentType.ETC;
            default -> null;
        };
    }

    @Override
    public FileContentType getResult(ResultSet rs, int columnIndex) throws SQLException {
        return switch (rs.getString(columnIndex)) {
            case "image" -> FileContentType.IMAGE;
            case "video" -> FileContentType.VIDEO;
            case "document" -> FileContentType.DOCUMENT;
            case "etc" -> FileContentType.ETC;
            default -> null;
        };
    }

    @Override
    public FileContentType getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return switch (cs.getString(columnIndex)) {
            case "image" -> FileContentType.IMAGE;
            case "video" -> FileContentType.VIDEO;
            case "document" -> FileContentType.DOCUMENT;
            case "etc" -> FileContentType.ETC;
            default -> null;
        };
    }
}