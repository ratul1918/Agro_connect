package com.arpon007.agro.service;

import com.arpon007.agro.model.Crop;
import com.arpon007.agro.repository.CropRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CropService {

    private static final Logger log = LoggerFactory.getLogger(CropService.class);
    private final CropRepository cropRepository;
    private final String UPLOAD_DIR = "uploads/crops/";

    public CropService(CropRepository cropRepository) {
        this.cropRepository = cropRepository;
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            log.error("Failed to create upload directory {}", UPLOAD_DIR, e);
        }
    }

    @Transactional
    public Crop addCrop(Crop crop, List<MultipartFile> images) throws IOException {
        List<String> imageUrls = new ArrayList<>();
        if (images != null) {
            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
                    String safeName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
                    String fileName = UUID.randomUUID() + "_" + safeName;
                    Path dir = Paths.get(UPLOAD_DIR);
                    Files.createDirectories(dir);
                    Path path = dir.resolve(fileName);
                    try {
                        Files.write(path, file.getBytes(), StandardOpenOption.CREATE,
                                StandardOpenOption.TRUNCATE_EXISTING);
                        imageUrls.add("/uploads/crops/" + fileName);
                    } catch (IOException e) {
                        // Skip failing file but continue with others
                        log.error("Failed to save image {}", fileName, e);
                    }
                }
            }
        }
        crop.setImages(imageUrls);
        return cropRepository.save(crop);
    }

    @Transactional
    public Crop updateCrop(Crop crop, List<MultipartFile> images) throws IOException {
        // Handle new images if provided
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
                    String safeName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
                    String fileName = UUID.randomUUID() + "_" + safeName;
                    Path dir = Paths.get(UPLOAD_DIR);
                    Files.createDirectories(dir);
                    Path path = dir.resolve(fileName);
                    try {
                        Files.write(path, file.getBytes(), StandardOpenOption.CREATE,
                                StandardOpenOption.TRUNCATE_EXISTING);
                        imageUrls.add("/uploads/crops/" + fileName);
                    } catch (IOException e) {
                        log.error("Failed to save image {}", fileName, e);
                    }
                }
            }
            if (!imageUrls.isEmpty()) {
                crop.setImages(imageUrls);
            }
        }
        return cropRepository.update(crop);
    }

    public List<Crop> getAllCrops(boolean isBangla) {
        return cropRepository.findAll(isBangla);
    }

    public Crop getCropById(Long id, boolean isBangla) {
        return cropRepository.findById(id, isBangla)
                .orElseThrow(() -> new RuntimeException("Crop not found"));
    }

    public List<Crop> getCropsByMarketplaceType(String marketplaceType, boolean isBangla) {
        // Get crops by marketplace type (will include BOTH as well)
        return cropRepository.findByMarketplaceType(marketplaceType);
    }

    public List<Crop> getCropsByFarmerId(Long farmerId) {
        return cropRepository.findByFarmerId(farmerId);
    }

    @Transactional
    public void markAsSold(Long cropId) {
        cropRepository.markAsSoldOut(cropId);
    }

    @Transactional
    public void markAsAvailable(Long cropId) {
        cropRepository.markAsAvailable(cropId);
    }

    @Transactional
    public void deleteCrop(Long cropId) {
        cropRepository.deleteById(cropId);
    }
}
