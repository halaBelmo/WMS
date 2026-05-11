package com.example.wms.services;
import com.example.wms.entities.User;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Date;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import java.security.Key;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;

@Service
public class JWTService {

    @Value("${jwt.secret}")
    private String secretKey;

    private User user;

    public String generateToken(User user) {

        Map<String, Object> claims = new HashMap<>();

        claims.put("role", user.getRole().getName().name());
        claims.put("companyId", user.getCompany().getId());
        

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(
                        new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)
                )
                .signWith(getKey())
                .compact();
    }

        private Key getKey() {

            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            return Keys.hmacShaKeyFor(keyBytes);

    }

    public String extractEmail(String token) {
    if (token == null || token.isBlank()) {
        return null;
    }

    return Jwts.parserBuilder()
            .setSigningKey(getKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
}

    public boolean validateToken(String token, UserDetails userDetails) {
       final String email = extractEmail(token);
       return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));

}
    public boolean isTokenExpired(String token) {
       return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
    }


}