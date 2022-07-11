import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import App from '../App';
import LookRoute from "./look";
import Authorize from "./shopify/Authorize";
import SettingsRoute from "./settings";
import EmbedRoute from './embed';
// You should always import these components even without using else app back navigation will break
import { ClientRouter, useClientRouting, useRoutePropagation, RoutePropagator } from '@shopify/app-bridge-react';
const AppRoutes = (props) => {


	return (
		<>
		<Routes>
			{/* <Route path="/shopify" element={<Authorize />} />
			<Route path="/shopify/callback" element={<Authorize />} />
			<Route
					path="/install"
					element={<Navigate to={{
						pathname: "/shopify/authorize",
						search: window.location.search,
					}} replace={true} />}
				/>
			<Route path="/shopify/authorize" element={<Authorize />} /> */}
			<Route path="/embed" element={<EmbedRoute />} />
			<Route path="/settings" element={<SettingsRoute />} />
			<Route path="/looks" element={<App />} />
			<Route path="/looks/:id" element={<LookRoute />} />
			<Route path="/looks/create" element={<LookRoute />} />
			<Route path="/shopify" element={<App />} />
			<Route path="/shopify/callback" element={<App />} />
			<Route path="/authorize" element={<Authorize />} />
			<Route path="/" element={<App />} />
		</Routes>
		</>
	)
}

export default AppRoutes