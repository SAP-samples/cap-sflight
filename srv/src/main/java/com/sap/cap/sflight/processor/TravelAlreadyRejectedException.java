package com.sap.cap.sflight.processor;

import com.sap.cds.services.ErrorStatuses;
import com.sap.cds.services.ServiceException;

public class TravelAlreadyRejectedException extends ServiceException {
    public TravelAlreadyRejectedException(String message, Object... parameters) {
        super(ErrorStatuses.BAD_REQUEST, message, parameters);
    }
}
