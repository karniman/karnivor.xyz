(() => {
  const forms = document.querySelectorAll("[data-kit-subscribe]");

  forms.forEach((form) => {
    const emailInput = form.querySelector('input[name="email_address"]');
    const message = form.querySelector("[data-subscribe-message]");
    const submit = form.querySelector('button[type="submit"]');
    const submitLabel = form.querySelector("[data-submit-label]");
    const defaultLabel = submitLabel?.textContent || "Подписаться";

    const setMessage = (text, state) => {
      if (!message) return;
      message.textContent = text;
      if (state) {
        message.dataset.state = state;
      } else {
        delete message.dataset.state;
      }
    };

    const setLoading = (isLoading) => {
      if (submit) submit.disabled = isLoading;
      if (submitLabel) submitLabel.textContent = isLoading ? "Отправляем..." : defaultLabel;
    };

    const getKitError = (result) => {
      return result?.errors?.messages?.[0] || result?.message || "";
    };

    const submitHostedForm = async () => {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: new FormData(form),
      });
      const result = await response.json().catch(() => null);

      if (result?.status === "failed") {
        const error = new Error(getKitError(result) || "Kit rejected the subscription.");
        error.isValidationError = true;
        throw error;
      }

      if (!response.ok) {
        throw new Error(`Kit hosted form failed with ${response.status}`);
      }
    };

    const submitApiFallback = async (email) => {
      const endpoint = form.dataset.apiEndpoint;
      const apiKey = form.dataset.apiKey;

      if (!endpoint || !apiKey) {
        throw new Error("Не найден резервный адрес подписки.");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          api_key: apiKey,
          email,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.status === "failed") {
        throw new Error(getKitError(result) || `Kit API failed with ${response.status}`);
      }
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!(emailInput instanceof HTMLInputElement)) return;
      if (!emailInput.reportValidity()) return;

      if (!form.action) {
        setMessage("Не найден адрес формы для подписки.", "error");
        return;
      }

      setMessage("", "");
      setLoading(true);

      try {
        try {
          await submitHostedForm();
        } catch (error) {
          if (error?.isValidationError) throw error;
          await submitApiFallback(emailInput.value.trim());
        }

        form.reset();
        setMessage("Готово! Проверьте почту, чтобы подтвердить подписку.", "success");
      } catch (error) {
        const fallback = "Не получилось оформить подписку. Попробуйте еще раз.";
        setMessage(error instanceof Error && error.message ? error.message : fallback, "error");
      } finally {
        setLoading(false);
      }
    });
  });
})();
