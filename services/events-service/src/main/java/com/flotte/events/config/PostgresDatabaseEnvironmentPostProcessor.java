package com.flotte.events.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

import java.sql.*;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Crée la base events_db avant l'initialisation du DataSource.
 * Même pattern que les autres services de la flotte.
 */
public class PostgresDatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Pattern JDBC_PG = Pattern.compile("jdbc:postgresql://([^/]+)/([^?]+)");

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Binder binder = Binder.get(environment);
        boolean autoCreate = binder.bind("flotte.postgres.auto-create-databases", Bindable.of(Boolean.class))
                .orElse(true);
        if (!autoCreate) return;

        String rawUrl = resolveProperty(binder, environment, "spring.datasource.url", "SPRING_DATASOURCE_URL");
        if (rawUrl == null || !rawUrl.startsWith("jdbc:postgresql:")) return;

        String databases = resolveProperty(binder, environment, "flotte.postgres.databases", null);
        if (databases == null || databases.isBlank()) {
            Matcher urlMatch = JDBC_PG.matcher(rawUrl);
            if (!urlMatch.find()) return;
            databases = urlMatch.group(2);
        }

        String user = resolveProperty(binder, environment, "spring.datasource.username", "SPRING_DATASOURCE_USERNAME");
        if (user == null) user = "postgres";

        String password = resolveProperty(binder, environment, "spring.datasource.password", "SPRING_DATASOURCE_PASSWORD");
        if (password == null) password = "";

        String bootstrapUrl = toBootstrapUrl(rawUrl);

        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("Driver PostgreSQL introuvable", e);
        }

        String[] names = Arrays.stream(databases.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toArray(String[]::new);

        try (Connection conn = DriverManager.getConnection(bootstrapUrl, user, password)) {
            conn.setAutoCommit(true);
            for (String db : names) createDatabaseIfMissing(conn, db);
        } catch (SQLException e) {
            throw new IllegalStateException("Impossible de créer les bases PostgreSQL (bootstrap-url=" + bootstrapUrl + ")", e);
        }
    }

    private String resolveProperty(Binder binder, ConfigurableEnvironment env, String key, String envVar) {
        String value = binder.bind(key, Bindable.of(String.class)).orElse(null);
        if (value == null) value = env.getProperty(key);
        if (value == null && envVar != null) value = System.getenv(envVar);
        return value;
    }

    static String toBootstrapUrl(String jdbcUrl) {
        Matcher m = JDBC_PG.matcher(jdbcUrl);
        if (!m.find()) throw new IllegalArgumentException("URL JDBC PostgreSQL invalide: " + jdbcUrl);
        return "jdbc:postgresql://" + m.group(1) + "/postgres";
    }

    private static void createDatabaseIfMissing(Connection conn, String databaseName) throws SQLException {
        if (!databaseName.matches("[a-zA-Z0-9_]+"))
            throw new IllegalArgumentException("Nom de base invalide: " + databaseName);
        try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM pg_database WHERE datname = ?")) {
            ps.setString(1, databaseName);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return;
            }
        }
        try (Statement st = conn.createStatement()) {
            st.executeUpdate("CREATE DATABASE " + databaseName);
        }
    }
}
