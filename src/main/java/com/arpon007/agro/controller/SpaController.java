package com.arpon007.agro.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Forward all non-API and non-static-file requests to index.html
    // This allows React Router to handle the routing on the client side
    // matches everything not starting with /api, /uploads, /invoices, /ws and not
    // containing a dot (file extension)
    @RequestMapping(value = "/**/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}
