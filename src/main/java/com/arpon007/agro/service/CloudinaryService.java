package com.arpon007.agro.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        if (isConfigured()) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true));
            log.info("Cloudinary configured successfully for cloud: {}", cloudName);
        } else {
            log.warn(
                    "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env");
        }
    }

    public boolean isConfigured() {
        return cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
    }

    /**
     * Upload an image to Cloudinary
     * 
     * @param file   The MultipartFile to upload
     * @param folder The folder in Cloudinary (e.g., "agro/crops", "agro/blogs")
     * @return The secure URL of the uploaded image, or null on failure
     */
    public String uploadImage(MultipartFile file, String folder) {
        if (!isConfigured()) {
            log.warn("Cloudinary not configured, cannot upload image");
            return null;
        }

        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto"));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded to Cloudinary: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            return null;
        }
    }

    /**
     * Delete an image from Cloudinary
     * 
     * @param publicId The public ID of the image to delete
     * @return true if deleted successfully
     */
    public boolean deleteImage(String publicId) {
        if (!isConfigured() || publicId == null || publicId.isBlank()) {
            return false;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Image deleted from Cloudinary: {}", publicId);
            return true;
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", publicId, e);
            return false;
        }
    }

    /**
     * Extract public ID from a Cloudinary URL for deletion
     * 
     * @param url The Cloudinary URL
     * @return The public ID
     */
    public String extractPublicId(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }
        // URL format:
        // https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{filename}.{ext}
        // We need: {folder}/{filename} (without extension)
        try {
            String[] parts = url.split("/upload/");
            if (parts.length > 1) {
                String pathWithVersion = parts[1];
                // Remove version if present (v followed by numbers)
                String path = pathWithVersion.replaceFirst("v\\d+/", "");
                // Remove file extension
                int lastDot = path.lastIndexOf('.');
                if (lastDot > 0) {
                    return path.substring(0, lastDot);
                }
                return path;
            }
        } catch (Exception e) {
            log.error("Failed to extract public ID from URL: {}", url, e);
        }
        return null;
    }
}
