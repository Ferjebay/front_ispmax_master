export interface Device {
  id: string;
  ip: string;
  userAgent: string;
  created_at: string;
}

interface AuthFlow {
  step: "idle" | "otp" | "qr" | "devices";
  tempToken: string | null;
  qrCode: string | null;
  devices: Device[];
}

const EMPTY_FLOW: AuthFlow = {
  step: "idle",
  tempToken: null,
  qrCode: null,
  devices: [],
};

interface SidebarItem {
  label: string;
  ruta: string;
  icono: string;
  orden: number;
  permiso: string;
  children: SidebarItem[];
  category?: string;
}

interface UserState {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  sidebar?: SidebarItem[];
}

export function useAuth() {
  const { api } = useHelper();
  const router = useRouter();
  const toast = useToast();

  const loading = ref(false);
  const flow = useState<AuthFlow>("auth_flow", () => ({ ...EMPTY_FLOW }));
  const user = useState<UserState | null>("user", () => null);

  const login = async (email: string, password: string) => {
    loading.value = true;
    try {
      // El server route registra el token en la cookie y no lo expone al cliente
      const data = await $fetch<any>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (data.requiresTwoFactor) {
        flow.value = {
          step: data.needsQrScan ? "qr" : "otp",
          tempToken: data.tempToken,
          qrCode: data.qrCode ?? null,
          devices: [],
        };
        return;
      }

      if (data.requiresDeviceRemoval) {
        flow.value = {
          step: "devices",
          tempToken: null,
          qrCode: null,
          devices: data.devices,
        };
        return;
      }

      flow.value = { ...EMPTY_FLOW };
      user.value = { ...data, sidebar: data.sidebar ?? [] };
      await router.push("/dashboard");
    } catch (error: any) {
      toast.add({
        title: "Error al iniciar sesión",
        description: error?.data?.message ?? "Credenciales inválidas",
        color: "error",
      });
    } finally {
      loading.value = false;
    }
  };

  const verify2fa = async (code: string) => {
    const data = await $fetch<any>("/api/auth/2fa", {
      method: "POST",
      body: { tempToken: flow.value.tempToken, code },
    });

    if (data.requiresDeviceRemoval) {
      flow.value = {
        step: "devices",
        tempToken: null,
        qrCode: null,
        devices: data.devices,
      };
      return;
    }

    flow.value = { ...EMPTY_FLOW };
    user.value = { ...data, sidebar: data.sidebar ?? [] };
    await router.push("/dashboard");
  };

  const removeDevice = async (deviceId: string) => {
    await api(`devices/${deviceId}`, { method: "DELETE" });
    flow.value = { ...EMPTY_FLOW };
  };

  const resetFlow = () => {
    flow.value = { ...EMPTY_FLOW };
  };

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    user.value = null;
    flow.value = { ...EMPTY_FLOW };
    router.push("/");
  };

  const token = useCookie("auth_token");
  const isAuthenticated = computed(() => !!token.value);

  return {
    login,
    verify2fa,
    removeDevice,
    resetFlow,
    logout,
    isAuthenticated,
    flow,
    loading,
    user,
  };
}
