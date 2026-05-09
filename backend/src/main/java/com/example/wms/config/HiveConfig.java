package com.example.wms.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
@Configuration
public class HiveConfig {

    @Bean(name = "hiveDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.hive")
    public DataSource hiveDataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:hive2://localhost:10000/default")
                .driverClassName("org.apache.hive.jdbc.HiveDriver")
                .build();
    }

    @Bean(name = "hiveJdbcTemplate")
    public JdbcTemplate hiveJdbcTemplate(@Qualifier("hiveDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}