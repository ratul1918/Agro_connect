package com.arpon007.agro.service;

import com.arpon007.agro.model.MarketPrice;
import com.arpon007.agro.repository.MarketPriceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarketPriceService {

    private final MarketPriceRepository repository;

    public MarketPriceService(MarketPriceRepository repository) {
        this.repository = repository;
    }

    public List<MarketPrice> getPrices(String district, boolean isBangla) {
        if (district != null && !district.isEmpty()) {
            return repository.findByDistrict(district, isBangla);
        }
        return repository.findAll(isBangla);
    }

    public void addPrice(MarketPrice price) {
        repository.save(price);
    }
}
