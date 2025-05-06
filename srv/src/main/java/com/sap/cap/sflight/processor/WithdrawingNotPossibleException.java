package com.sap.cap.sflight.processor;

import com.sap.cds.services.ErrorStatuses;
import com.sap.cds.services.ServiceException;

public class WithdrawingNotPossibleException extends ServiceException {
    public WithdrawingNotPossibleException(String message, Object... parameters) {
        super(ErrorStatuses.BAD_REQUEST, message, parameters);
    }
}
