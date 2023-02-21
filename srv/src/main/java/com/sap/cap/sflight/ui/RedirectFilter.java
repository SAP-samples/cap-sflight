package com.sap.cap.sflight.ui;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.GenericFilterBean;

/**
 * Redirects calls on relative paths coming from the Fiori apps in local development to the correct service endpoints.
 * In cloud deployments this is not needed, as paths are managed differently by HTML5 apps repo & approuter.
 */
@Component
@Profile("!cloud")
public class RedirectFilter extends GenericFilterBean {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String[] uiServicePaths = {
            "/travel_processor/webapp/processor",
            "/travel_analytics/webapp/analytics"
        };

        String path = req.getRequestURI();
        for (String uiServicePath : uiServicePaths) {
            if (path.startsWith(uiServicePath)) {
                res.resetBuffer();
                res.setStatus(308);
                res.setHeader("Location", path.substring(uiServicePath.lastIndexOf('/')));
                res.flushBuffer();
                return;
            }
        }

        chain.doFilter(req, res);
    }

}
