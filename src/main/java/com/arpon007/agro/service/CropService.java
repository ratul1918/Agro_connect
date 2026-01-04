package com.arpon007.agro.service;

import com.arpon007.agro.model.Crop;
import com.arpon007.agro.repository.CropRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class CropService {

    private static final Logger log = LoggerFactory.getLogger(CropService.class);
    private final CropRepository cropRepository;
    private final CloudinaryService cloudinaryService;

    public CropService(CropRepository cropRepository, CloudinaryService cloudinaryService) {
        this.cropRepository = cropRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional
    public Crop addCrop(Crop crop, List<MultipartFile> images) throws IOException {
        List<String> imageUrls = new ArrayList<>();
        if (images != null) {
            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String imageUrl = cloudinaryService.uploadImage(file, "agro/crops");
                    if (imageUrl != null) {
                        imageUrls.add(imageUrl);
                        log.info("Uploaded crop image to Cloudinary: {}", imageUrl);
                    } else {
                        log.warn("Failed to upload image to Cloudinary: {}", file.getOriginalFilename());
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
                    String imageUrl = cloudinaryService.uploadImage(file, "agro/crops");
                    if (imageUrl != null) {
                        imageUrls.add(imageUrl);
                        log.info("Uploaded crop image to Cloudinary: {}", imageUrl);
                    } else {
                        log.warn("Failed to upload image to Cloudinary: {}", file.getOriginalFilename());
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
