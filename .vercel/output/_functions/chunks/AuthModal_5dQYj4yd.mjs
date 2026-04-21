import { create } from 'zustand';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
import { M as registerUser, N as loginUser, O as requestPasswordReset, P as resetPassword } from './db_DD6f8SZr.mjs';
import { s as styles } from './_id_.991c0af2_DVfV6wdR.mjs';

const useCartStore = create((set, get) => ({
  items: [],
  tableNumber: null,
  sessionId: null,
  setTable: (tableNumber, sessionId) => set({ tableNumber, sessionId }),
  addItem: (product) => set((state) => {
    const existing = state.items.find((i) => i.product.id === product.id);
    if (existing) {
      return {
        items: state.items.map(
          (i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return { items: [...state.items, { product, quantity: 1 }] };
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter((i) => i.product.id !== productId)
  })),
  updateQuantity: (productId, quantity) => set((state) => ({
    items: quantity <= 0 ? state.items.filter((i) => i.product.id !== productId) : state.items.map(
      (i) => i.product.id === productId ? { ...i, quantity } : i
    )
  })),
  updateNotes: (productId, notes) => set((state) => ({
    items: state.items.map(
      (i) => i.product.id === productId ? { ...i, notes } : i
    )
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0)
}));
const useUserStore = create((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (value) => set({ loading: value }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ema_user_id");
      localStorage.removeItem("ema_user_token");
    }
    set({ user: null });
  }
}));
create((set) => ({
  isAuthenticated: false,
  loading: true,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ loading: value })
}));

function AuthModal({ tableNumber, onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!name.trim()) {
          setError("Introduce tu nombre");
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          setError("Introduce tu email");
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setError("La contraseña debe tener al menos 4 caracteres");
          setLoading(false);
          return;
        }
        const user = await registerUser(name.trim(), email.trim(), password);
        onAuthenticated(user);
      } else if (mode === "login") {
        if (!email.trim()) {
          setError("Introduce tu email");
          setLoading(false);
          return;
        }
        if (!password) {
          setError("Introduce tu contraseña");
          setLoading(false);
          return;
        }
        const user = await loginUser(email.trim(), password);
        onAuthenticated(user);
      } else if (mode === "forgot") {
        if (!email.trim()) {
          setError("Introduce tu email");
          setLoading(false);
          return;
        }
        const code = await requestPasswordReset(email.trim());
        setResetCode(code);
        setSuccess(`Tu código de verificación es: ${code}`);
        setMode("reset");
      } else if (mode === "reset") {
        if (!resetCode.trim()) {
          setError("Introduce el código de 6 dígitos");
          setLoading(false);
          return;
        }
        if (newPassword.length < 4) {
          setError("La nueva contraseña debe tener al menos 4 caracteres");
          setLoading(false);
          return;
        }
        await resetPassword(email.trim(), resetCode.trim(), newPassword);
        setSuccess("Contraseña actualizada correctamente");
        setPassword("");
        setResetCode("");
        setNewPassword("");
        setTimeout(() => {
          setMode("login");
          setSuccess("");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };
  const handleGuest = () => {
    const guestId = `guest_${Date.now()}`;
    const guestUser = {
      id: guestId,
      name: "Invitado",
      email: "",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("ema_user_id", guestId);
      localStorage.setItem("ema_user_token", `guest_${guestId}`);
    }
    onAuthenticated(guestUser);
  };
  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
  };
  return /* @__PURE__ */ jsx("div", { className: styles.overlay, children: /* @__PURE__ */ jsxs("div", { className: styles.card, children: [
    /* @__PURE__ */ jsx("div", { className: styles.logo, children: /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "ORDERLY", className: styles.logoImg }) }),
    /* @__PURE__ */ jsx("p", { className: styles.subtitle, children: mode === "forgot" || mode === "reset" ? "Recuperar contraseña" : "Sistema de pedidos digital" }),
    /* @__PURE__ */ jsxs("div", { className: styles.tableInfo, children: [
      "Estás en la ",
      /* @__PURE__ */ jsxs("strong", { children: [
        "Mesa ",
        tableNumber
      ] })
    ] }),
    (mode === "login" || mode === "register") && /* @__PURE__ */ jsxs("div", { className: styles.tabs, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: `${styles.tab} ${mode === "login" ? styles.tabActive : ""}`,
          onClick: () => switchMode("login"),
          type: "button",
          children: "Iniciar sesión"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: `${styles.tab} ${mode === "register" ? styles.tabActive : ""}`,
          onClick: () => switchMode("register"),
          type: "button",
          children: "Registrarse"
        }
      )
    ] }),
    (mode === "forgot" || mode === "reset") && /* @__PURE__ */ jsx(
      "button",
      {
        className: styles.backBtn,
        onClick: () => switchMode("login"),
        type: "button",
        children: "← Volver al inicio de sesión"
      }
    ),
    /* @__PURE__ */ jsxs("form", { className: styles.form, onSubmit: handleSubmit, children: [
      mode === "register" && /* @__PURE__ */ jsxs("div", { className: styles.inputGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles.label, children: "Nombre" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles.input,
            type: "text",
            placeholder: "Tu nombre",
            value: name,
            onChange: (e) => setName(e.target.value),
            autoComplete: "name"
          }
        )
      ] }),
      (mode === "login" || mode === "register" || mode === "forgot") && /* @__PURE__ */ jsxs("div", { className: styles.inputGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles.label, children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles.input,
            type: "email",
            placeholder: "tu@email.com",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            autoComplete: "email"
          }
        )
      ] }),
      (mode === "login" || mode === "register") && /* @__PURE__ */ jsxs("div", { className: styles.inputGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles.label, children: "Contraseña" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles.input,
            type: "password",
            placeholder: "••••••",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            autoComplete: mode === "register" ? "new-password" : "current-password"
          }
        )
      ] }),
      mode === "reset" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: styles.inputGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles.label, children: "Código de verificación" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: `${styles.input} ${styles.codeInput}`,
              type: "text",
              placeholder: "123456",
              value: resetCode,
              onChange: (e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
              inputMode: "numeric",
              maxLength: 6,
              autoComplete: "one-time-code"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles.inputGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles.label, children: "Nueva contraseña" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles.input,
              type: "password",
              placeholder: "••••••",
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              autoComplete: "new-password"
            }
          )
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: styles.error, children: error }),
      success && /* @__PURE__ */ jsx("div", { className: styles.success, children: success }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles.submitBtn,
          type: "submit",
          disabled: loading,
          children: loading ? "Cargando..." : mode === "login" ? "Entrar" : mode === "register" ? "Crear cuenta" : mode === "forgot" ? "Enviar código" : "Cambiar contraseña"
        }
      )
    ] }),
    mode === "login" && /* @__PURE__ */ jsx("div", { className: styles.forgotLink, children: /* @__PURE__ */ jsx("button", { className: styles.forgotBtn, onClick: () => switchMode("forgot"), type: "button", children: "¿Olvidaste tu contraseña?" }) }),
    mode === "reset" && /* @__PURE__ */ jsx("div", { className: styles.forgotLink, children: /* @__PURE__ */ jsx("button", { className: styles.forgotBtn, onClick: () => switchMode("forgot"), type: "button", children: "Reenviar código" }) }),
    (mode === "login" || mode === "register") && /* @__PURE__ */ jsx("div", { className: styles.guestLink, children: /* @__PURE__ */ jsx("button", { className: styles.guestBtn, onClick: handleGuest, type: "button", children: "Continuar como invitado" }) })
  ] }) });
}

export { AuthModal as A, useCartStore as a, useUserStore as u };
