import React, { useState, useEffect, useCallback } from "react";
import { api, useStoredToken, useStoredJSON } from "./lib/api";
import { useTheme } from "./lib/theme";
import { WHATSAPP_NUMBER } from "./config";

import { LoadingScreen } from "./components/LoadingScreen";
import { NavBar } from "./components/NavBar";

import { ShopView } from "./pages/ShopView";
import { ProductDetail } from "./pages/ProductDetail";
import { CartView } from "./pages/CartView";
import { LoginView } from "./pages/LoginView";
import { CheckoutView } from "./pages/CheckoutView";
import { AccountView } from "./pages/AccountView";
import { AboutView } from "./pages/AboutView";
import { AdminLoginView } from "./pages/AdminLoginView";
import { AdminDashboard } from "./pages/AdminDashboard";
import { TermsOfUsePage, TermsAndConditionsPage, PrivacyPolicyPage, DeveloperPage } from "./pages/LegalPages";

/* ---------------------------------------------------------
   THATHA LENTO — frontend
   Talks to the backend API (see ../thatha-lento-backend).
   Set VITE_API_URL in .env to point at it.
--------------------------------------------------------- */

export default function App() {
  const { mode, setMode, theme, ready } = useTheme();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Loading the collection...");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [bugReports, setBugReports] = useState([]);
  const [footprint, setFootprint] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  const [userToken, setUserToken] = useStoredToken("tl_user_token");
  const [adminToken, setAdminToken] = useStoredToken("tl_admin_token");
  const [currentUser, setCurrentUser] = useStoredJSON("tl_user_info");
  const [currentAdmin, setCurrentAdmin] = useStoredJSON("tl_admin_info");

  const [cart, setCart] = useState([]);
  const [view, setView] = useState(() =>
    localStorage.getItem("tl_admin_token") ? { name: "admin" } : { name: "shop", gender: "All" }
  );
  const [activeProduct, setActiveProduct] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("Loading products...");
        setProgress(30);
        const p = await api("/products");
        if (!cancelled) setProducts(p);

        try {
          const s = await api("/settings");
          if (!cancelled) setCurrencySymbol(s.currency_symbol || "$");
        } catch (e) {
          // keep default "$"
        }

        setProgress(60);
        if (userToken && currentUser) {
          setStatus("Restoring your session...");
          try {
            const [mine, fp] = await Promise.all([
              api("/orders/mine", { token: userToken }),
              api("/footprints/mine", { token: userToken }),
            ]);
            if (!cancelled) {
              setMyOrders(mine);
              setFootprint(fp);
            }
          } catch (e) {
            setUserToken(null);
            setCurrentUser(null);
          }
        }
        if (adminToken && currentAdmin) {
          try {
            if (currentAdmin.role === "full") {
              const [ord, bugs] = await Promise.all([
                api("/orders", { token: adminToken }),
                api("/bugs", { token: adminToken }),
              ]);
              if (!cancelled) {
                setOrders(ord);
                setBugReports(bugs);
              }
            } else {
              const bugs = await api("/bugs", { token: adminToken });
              if (!cancelled) setBugReports(bugs);
            }
          } catch (e) {
            setAdminToken(null);
            setCurrentAdmin(null);
          }
        }

        setProgress(100);
        setStatus("Ready");
      } catch (e) {
        setStatus("Could not reach the store. Is the backend running?");
      } finally {
        setTimeout(() => {
          if (!cancelled) setLoading(false);
        }, 350);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshProducts = useCallback(async () => setProducts(await api("/products")), []);

  const openProduct = (product) => {
    setActiveProduct(product);
    const entry = { productId: product.id, gender: product.gender, ts: Date.now() };
    setFootprint((f) => [...f, entry].slice(-50));
    if (userToken) {
      api("/footprints", {
        method: "POST",
        token: userToken,
        body: { productId: product.id, gender: product.gender },
      }).catch(() => {});
    }
  };

  const addToCart = (item) => setCart((c) => [...c, item]);
  const removeFromCart = (idx) => setCart((c) => c.filter((_, i) => i !== idx));

  const handleAuth = async ({ mode: authMode, email, password, name, phone, location }) => {
    const data =
      authMode === "signup"
        ? await api("/auth/register", {
            method: "POST",
            body: { name, email, password, phone, location },
          })
        : await api("/auth/login", { method: "POST", body: { email, password } });
    setUserToken(data.token);
    setCurrentUser(data.user);
    const [mine, fp] = await Promise.all([
      api("/orders/mine", { token: data.token }),
      api("/footprints/mine", { token: data.token }),
    ]);
    setMyOrders(mine);
    setFootprint(fp);
    if (view.redirectTo === "checkout") setView({ name: "checkout" });
    else setView({ name: "shop", gender: "All" });
  };

  const handleAdminLogin = async (email, code) => {
    const data = await api("/admin/login", { method: "POST", body: { email, code } });
    setAdminToken(data.token);
    setCurrentAdmin(data.admin);
    if (data.admin.role === "full") {
      const [ord, bugs] = await Promise.all([
        api("/orders", { token: data.token }),
        api("/bugs", { token: data.token }),
      ]);
      setOrders(ord);
      setBugReports(bugs);
    } else {
      setBugReports(await api("/bugs", { token: data.token }));
    }
    setView({ name: "admin" });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserToken(null);
    setCurrentAdmin(null);
    setAdminToken(null);
    setView({ name: "shop", gender: "All" });
  };

  const placeOrder = async ({ phone, location }) => {
    const order = await api("/orders", {
      method: "POST",
      token: userToken,
      body: {
        items: cart.map((c) => ({
          productId: c.productId,
          name: c.name,
          price: c.price,
          size: c.size,
          color: c.color,
          qty: c.qty,
        })),
        phone,
        location,
        termsAccepted: true,
        total: cart.reduce((sum, c) => sum + c.price * c.qty, 0),
      },
    });
    setMyOrders((o) => [order, ...o]);
    setCart([]);
    await refreshProducts();
    return order;
  };

  const updateProfile = async (phone, location) => {
    const data = await api("/auth/me", {
      method: "PATCH",
      token: userToken,
      body: { phone, location },
    });
    setCurrentUser(data.user);
    return data.user;
  };

  const submitBug = (message) =>
    api("/bugs", { method: "POST", token: userToken, body: { message } });

  const addProduct = async (product) => {
    const created = await api("/products", {
      method: "POST",
      token: adminToken,
      body: product,
    });
    setProducts((p) => [created, ...p]);
  };

  const updateProduct = async (id, patch) => {
    const updated = await api(`/products/${id}`, {
      method: "PATCH",
      token: adminToken,
      body: patch,
    });
    setProducts((list) => list.map((p) => (p.id === id ? updated : p)));
  };

  const deleteProduct = async (id) => {
    await api(`/products/${id}`, { method: "DELETE", token: adminToken });
    setProducts((list) => list.filter((p) => p.id !== id));
  };

  const updateOrderStatus = async (id, status) => {
    await api(`/orders/${id}/status`, {
      method: "PATCH",
      token: adminToken,
      body: { status },
    });
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const updateCurrency = async (symbol) => {
    const data = await api("/settings/currency_symbol", {
      method: "PATCH",
      token: adminToken,
      body: { value: symbol },
    });
    setCurrencySymbol(data.value);
  };

  if (!ready || loading)
    return <LoadingScreen theme={theme} progress={progress} status={status} />;

  const footerLinkStyle = {
    background: "none",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 12,
    textDecoration: "underline",
    padding: 0,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        transition: "background .2s ease, color .2s ease",
      }}
    >
      <NavBar
        theme={theme}
        mode={mode}
        setMode={setMode}
        view={view}
        setView={setView}
        cartCount={cart.length}
        currentUser={currentUser}
        currentAdmin={currentAdmin}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {currentAdmin ? (
        <AdminDashboard
          theme={theme}
          currentAdmin={currentAdmin}
          products={products}
          orders={orders}
          bugReports={bugReports}
          addProduct={addProduct}
          updateProduct={updateProduct}
          deleteProduct={deleteProduct}
          updateOrderStatus={updateOrderStatus}
          currencySymbol={currencySymbol}
          updateCurrency={updateCurrency}
        />
      ) : (
        <>
          {view.name === "shop" && (
            <ShopView
              products={products}
              theme={theme}
              view={view}
              setView={setView}
              openProduct={openProduct}
              footprint={footprint}
              currencySymbol={currencySymbol}
            />
          )}
          {view.name === "about" && <AboutView theme={theme} />}
          {view.name === "cart" && (
            <CartView
              cart={cart}
              theme={theme}
              setView={setView}
              removeFromCart={removeFromCart}
              currentUser={currentUser}
              currencySymbol={currencySymbol}
            />
          )}
          {view.name === "login" && (
            <LoginView
              theme={theme}
              setView={setView}
              onLogin={handleAuth}
              redirectTo={view.redirectTo}
            />
          )}
          {view.name === "checkout" && currentUser && (
            <CheckoutView
              theme={theme}
              cart={cart}
              placeOrder={placeOrder}
              setView={setView}
              currencySymbol={currencySymbol}
              currentUser={currentUser}
              updateProfile={updateProfile}
            />
          )}
          {view.name === "account" && currentUser && (
            <AccountView
              theme={theme}
              currentUser={currentUser}
              myOrders={myOrders}
              submitBug={submitBug}
              onLogout={handleLogout}
              currencySymbol={currencySymbol}
              updateProfile={updateProfile}
            />
          )}
          {view.name === "admin-login" && (
            <AdminLoginView theme={theme} onAdminLogin={handleAdminLogin} />
          )}
          {view.name === "terms-of-use" && <TermsOfUsePage />}
          {view.name === "terms-and-conditions" && <TermsAndConditionsPage />}
          {view.name === "privacy-policy" && <PrivacyPolicyPage />}
          {view.name === "developer" && <DeveloperPage theme={theme} />}
        </>
      )}

      {activeProduct && (
        <ProductDetail
          product={activeProduct}
          theme={theme}
          onClose={() => setActiveProduct(null)}
          addToCart={addToCart}
          currencySymbol={currencySymbol}
          myOrders={myOrders}
          userToken={userToken}
          currentUser={currentUser}
        />
      )}

      <div
        style={{
          borderTop: `1px solid ${theme.border}`,
          marginTop: 40,
          padding: "26px 20px",
          textAlign: "center",
          fontSize: 12,
          opacity: 0.55,
        }}
      >
        <div style={{ marginBottom: 10 }}>
          THATHA LENTO — questions? message us on{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.accent }}
          >
            WhatsApp
          </a>
          .
        </div>
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button style={footerLinkStyle} onClick={() => setView({ name: "terms-of-use" })}>
            Terms of Use
          </button>
          <button style={footerLinkStyle} onClick={() => setView({ name: "terms-and-conditions" })}>
            Terms &amp; Conditions
          </button>
          <button style={footerLinkStyle} onClick={() => setView({ name: "privacy-policy" })}>
            Privacy Policy
          </button>
          <button style={footerLinkStyle} onClick={() => setView({ name: "developer" })}>
            Developer
          </button>
        </div>
      </div>
    </div>
  );
    }
