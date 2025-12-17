package com.arpon007.agro.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    // Removed duplicate addResourceHandlers; handled in WebConfig
}
