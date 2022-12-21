package com.sap.cap.sflight.ui;

import java.io.PrintWriter;

import com.sap.cds.adapter.IndexContentProvider;
import com.sap.cds.adapter.IndexContentProviderFactory;

/**
 * Explicitly adds links to UI resources provided by this application to the index page
 */
public class UiIndexContentProviderFactory implements IndexContentProviderFactory {

	@Override
	public IndexContentProvider create() {
		return new UiIndexContentProvider();
	}

	@Override
	public boolean isEnabled() {
		return true;
	}

	private static class UiIndexContentProvider implements IndexContentProvider {

		private static final String ENDPOINT_START = "" +
		"                <ul>\n";

		private static final String ENDPOINT = "" +
		"                    <li>\n" +
		"                        <a href=\"%s\">%s</a>\n" +
		"                    </li>\n";

		private static final String ENDPOINT_END = "" +
		"                </ul>\n";

		@Override
		public String getSectionTitle() {
			return "UI endpoints";
		}

		@Override
		public void writeContent(PrintWriter writer, String contextPath) {
			writer.print(ENDPOINT_START);
			writer.printf(ENDPOINT, contextPath + "/travel_processor/webapp/index.html", "Travel Processor UI");
			writer.printf(ENDPOINT, contextPath + "/travel_analytics/webapp/index.html", "Travel Analytics UI");
			writer.print(ENDPOINT_END);
		}

	}

}
