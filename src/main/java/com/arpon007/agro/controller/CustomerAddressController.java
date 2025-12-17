package com.arpon007.agro.controller;

import com.arpon007.agro.model.CustomerAddress;
import com.arpon007.agro.repository.CustomerAddressRepository;
import com.arpon007.agro.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/addresses")
@PreAuthorize("hasRole('GENERAL_CUSTOMER')")
public class CustomerAddressController {

    private final CustomerAddressRepository addressRepository;

    public CustomerAddressController(CustomerAddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    /**
     * Get all addresses for logged-in customer
     */
    @GetMapping
    public ResponseEntity<List<CustomerAddress>> getAddresses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<CustomerAddress> addresses = addressRepository.findByUserId(userDetails.getId());
        return ResponseEntity.ok(addresses);
    }

    /**
     * Get address by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAddress(@PathVariable Long id) {
        try {
            CustomerAddress address = addressRepository.findById(id);
            return ResponseEntity.ok(address);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get default address
     */
    @GetMapping("/default")
    public ResponseEntity<?> getDefaultAddress(@AuthenticationPrincipal CustomUserDetails userDetails) {
        CustomerAddress address = addressRepository.findDefaultByUserId(userDetails.getId());
        if (address == null) {
            return ResponseEntity.ok(Map.of("message", "No default address set"));
        }
        return ResponseEntity.ok(address);
    }

    /**
     * Create new address
     */
    @PostMapping
    public ResponseEntity<?> createAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CustomerAddress address) {
        try {
            address.setUserId(userDetails.getId());
            CustomerAddress saved = addressRepository.save(address);
            return ResponseEntity.ok(Map.of(
                    "message", "Address added successfully",
                    "address", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to add address: " + e.getMessage()));
        }
    }

    /**
     * Update address
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(
            @PathVariable Long id,
            @RequestBody CustomerAddress address) {
        try {
            address.setId(id);
            addressRepository.update(address);
            return ResponseEntity.ok(Map.of("message", "Address updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update address: " + e.getMessage()));
        }
    }

    /**
     * Set address as default
     */
    @PutMapping("/{id}/set-default")
    public ResponseEntity<?> setAsDefault(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            addressRepository.setAsDefault(id, userDetails.getId());
            return ResponseEntity.ok(Map.of("message", "Default address updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to set default: " + e.getMessage()));
        }
    }

    /**
     * Delete address
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        try {
            addressRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to delete address: " + e.getMessage()));
        }
    }
}
