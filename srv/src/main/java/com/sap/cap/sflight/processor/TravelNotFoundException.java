package com.sap.cap.sflight.processor;

import com.sap.cds.services.ErrorStatuses;
import com.sap.cds.services.ServiceException;

public class TravelNotFoundException extends ServiceException {
    public TravelNotFoundException(String message, Object... paramters) {
        super(ErrorStatuses.NOT_FOUND, message, paramters);
    }
}
