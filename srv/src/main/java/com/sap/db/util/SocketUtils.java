package com.sap.db.util;

import java.net.Socket;
import java.nio.channels.AsynchronousSocketChannel;

// Override HANA class, which uses feature not supported in Native Images
// See https://github.com/oracle/graal/issues/6457
public final class SocketUtils {
	private SocketUtils() {
		throw new AssertionError("Non-instantiable class");
	}

	public static void setKeepAliveOptions(Socket socket,
			int tcpKeepAliveIdle, int tcpKeepAliveInterval, int tcpKeepAliveCount) {

	}

	public static void setKeepAliveOptions(AsynchronousSocketChannel channel,
			int tcpKeepAliveIdle, int tcpKeepAliveInterval, int tcpKeepAliveCount) {

	}
}
