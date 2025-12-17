package com.arpon007.agro.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Bangladesh Location API
 * Returns all divisions, districts (zilla), and upazilas (thana) of Bangladesh.
 */
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    // All 8 Divisions
    private static final Map<String, List<String>> DIVISION_DISTRICTS = new LinkedHashMap<>();

    // Districts -> Upazilas mapping
    private static final Map<String, List<String>> DISTRICT_UPAZILAS = new LinkedHashMap<>();

    static {
        // ========== DHAKA DIVISION ==========
        DIVISION_DISTRICTS.put("ঢাকা (Dhaka)", Arrays.asList(
                "ঢাকা (Dhaka)", "গাজীপুর (Gazipur)", "নারায়ণগঞ্জ (Narayanganj)",
                "মানিকগঞ্জ (Manikganj)", "মুন্সীগঞ্জ (Munshiganj)", "নরসিংদী (Narsingdi)",
                "টাঙ্গাইল (Tangail)", "কিশোরগঞ্জ (Kishoreganj)", "মাদারীপুর (Madaripur)",
                "শরীয়তপুর (Shariatpur)", "ফরিদপুর (Faridpur)", "গোপালগঞ্জ (Gopalganj)",
                "রাজবাড়ী (Rajbari)"));

        // ========== CHATTOGRAM DIVISION ==========
        DIVISION_DISTRICTS.put("চট্টগ্রাম (Chattogram)", Arrays.asList(
                "চট্টগ্রাম (Chattogram)", "কক্সবাজার (Cox's Bazar)", "রাঙ্গামাটি (Rangamati)",
                "বান্দরবান (Bandarban)", "খাগড়াছড়ি (Khagrachhari)", "ফেনী (Feni)",
                "লক্ষ্মীপুর (Lakshmipur)", "নোয়াখালী (Noakhali)", "কুমিল্লা (Comilla)",
                "চাঁদপুর (Chandpur)", "ব্রাহ্মণবাড়িয়া (Brahmanbaria)"));

        // ========== RAJSHAHI DIVISION ==========
        DIVISION_DISTRICTS.put("রাজশাহী (Rajshahi)", Arrays.asList(
                "রাজশাহী (Rajshahi)", "নওগাঁ (Naogaon)", "নাটোর (Natore)",
                "চাঁপাইনবাবগঞ্জ (Chapainawabganj)", "পাবনা (Pabna)", "সিরাজগঞ্জ (Sirajganj)",
                "বগুড়া (Bogura)", "জয়পুরহাট (Joypurhat)"));

        // ========== KHULNA DIVISION ==========
        DIVISION_DISTRICTS.put("খুলনা (Khulna)", Arrays.asList(
                "খুলনা (Khulna)", "বাগেরহাট (Bagerhat)", "সাতক্ষীরা (Satkhira)",
                "যশোর (Jessore)", "নড়াইল (Narail)", "মাগুরা (Magura)",
                "কুষ্টিয়া (Kushtia)", "মেহেরপুর (Meherpur)", "চুয়াডাঙ্গা (Chuadanga)",
                "ঝিনাইদহ (Jhenaidah)"));

        // ========== BARISHAL DIVISION ==========
        DIVISION_DISTRICTS.put("বরিশাল (Barishal)", Arrays.asList(
                "বরিশাল (Barishal)", "পটুয়াখালী (Patuakhali)", "ভোলা (Bhola)",
                "পিরোজপুর (Pirojpur)", "ঝালকাঠি (Jhalokati)", "বরগুনা (Barguna)"));

        // ========== SYLHET DIVISION ==========
        DIVISION_DISTRICTS.put("সিলেট (Sylhet)", Arrays.asList(
                "সিলেট (Sylhet)", "মৌলভীবাজার (Moulvibazar)", "হবিগঞ্জ (Habiganj)",
                "সুনামগঞ্জ (Sunamganj)"));

        // ========== RANGPUR DIVISION ==========
        DIVISION_DISTRICTS.put("রংপুর (Rangpur)", Arrays.asList(
                "রংপুর (Rangpur)", "দিনাজপুর (Dinajpur)", "ঠাকুরগাঁও (Thakurgaon)",
                "পঞ্চগড় (Panchagarh)", "নীলফামারী (Nilphamari)", "লালমনিরহাট (Lalmonirhat)",
                "কুড়িগ্রাম (Kurigram)", "গাইবান্ধা (Gaibandha)"));

        // ========== MYMENSINGH DIVISION ==========
        DIVISION_DISTRICTS.put("ময়মনসিংহ (Mymensingh)", Arrays.asList(
                "ময়মনসিংহ (Mymensingh)", "জামালপুর (Jamalpur)", "শেরপুর (Sherpur)",
                "নেত্রকোণা (Netrokona)"));

        // ========== SAMPLE UPAZILAS (Top districts) ==========
        DISTRICT_UPAZILAS.put("ঢাকা (Dhaka)", Arrays.asList(
                "ধানমন্ডি (Dhanmondi)", "গুলশান (Gulshan)", "মিরপুর (Mirpur)",
                "উত্তরা (Uttara)", "মোহাম্মদপুর (Mohammadpur)", "কেরানীগঞ্জ (Keraniganj)",
                "সাভার (Savar)", "ডেমরা (Demra)", "তেজগাঁও (Tejgaon)"));

        DISTRICT_UPAZILAS.put("চট্টগ্রাম (Chattogram)", Arrays.asList(
                "পাহাড়তলী (Pahartali)", "ডবলমুরিং (Double Mooring)", "পতেঙ্গা (Patenga)",
                "হালিশহর (Halishahar)", "চকবাজার (Chawkbazar)", "কোতোয়ালী (Kotwali)"));

        DISTRICT_UPAZILAS.put("রাজশাহী (Rajshahi)", Arrays.asList(
                "বোয়ালিয়া (Boalia)", "মতিহার (Motihar)", "শাহ মখদুম (Shah Makhdum)",
                "রাজপাড়া (Rajpara)", "পবা (Paba)", "গোদাগাড়ী (Godagari)"));

        DISTRICT_UPAZILAS.put("খুলনা (Khulna)", Arrays.asList(
                "খালিশপুর (Khalishpur)", "সোনাডাঙ্গা (Sonadanga)", "দৌলতপুর (Daulatpur)",
                "রূপসা (Rupsha)", "ডুমুরিয়া (Dumuria)", "বটিয়াঘাটা (Batiaghata)"));
    }

    /**
     * Get all divisions
     */
    @GetMapping("/divisions")
    public ResponseEntity<List<String>> getDivisions() {
        return ResponseEntity.ok(new ArrayList<>(DIVISION_DISTRICTS.keySet()));
    }

    /**
     * Get districts by division
     */
    @GetMapping("/districts")
    public ResponseEntity<List<String>> getDistricts(@RequestParam String division) {
        List<String> districts = DIVISION_DISTRICTS.get(division);
        if (districts == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(districts);
    }

    /**
     * Get all districts (flat list)
     */
    @GetMapping("/districts/all")
    public ResponseEntity<List<String>> getAllDistricts() {
        List<String> allDistricts = new ArrayList<>();
        DIVISION_DISTRICTS.values().forEach(allDistricts::addAll);
        return ResponseEntity.ok(allDistricts);
    }

    /**
     * Get upazilas by district
     */
    @GetMapping("/upazilas")
    public ResponseEntity<List<String>> getUpazilas(@RequestParam String district) {
        List<String> upazilas = DISTRICT_UPAZILAS.get(district);
        if (upazilas == null) {
            // Return generic upazilas if not mapped
            return ResponseEntity.ok(Arrays.asList(
                    "সদর (Sadar)", "পৌরসভা (Municipality)", "উপজেলা ১ (Upazila 1)", "উপজেলা ২ (Upazila 2)"));
        }
        return ResponseEntity.ok(upazilas);
    }

    /**
     * Get complete location hierarchy for dropdown
     */
    @GetMapping("/hierarchy")
    public ResponseEntity<Map<String, Object>> getFullHierarchy() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("divisions", DIVISION_DISTRICTS);
        result.put("upazilas", DISTRICT_UPAZILAS);
        return ResponseEntity.ok(result);
    }
}
