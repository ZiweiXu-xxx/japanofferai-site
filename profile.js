// JapanOffer AI - Step 26 Profile + CV Upload MVP
// Requires:
// 1. auth-config.js with Supabase URL and anon/publishable key.
// 2. Supabase SQL setup in profile_setup.sql.
// 3. User must be logged in before uploading CV.

(function () {
  const authBox = document.getElementById("authBox");
  const uploadDrop = document.getElementById("uploadDrop");
  const cvInput = document.getElementById("cvInput");
  const cvCard = document.getElementById("cvCard");
  const cvName = document.getElementById("cvName");
  const cvMeta = document.getElementById("cvMeta");
  const downloadCvButton = document.getElementById("downloadCvButton");
  const deleteCvButton = document.getElementById("deleteCvButton");
  const uploadStatus = document.getElementById("uploadStatus");

  const fullName = document.getElementById("fullName");
  const headline = document.getElementById("headline");
  const targetMarket = document.getElementById("targetMarket");
  const careerDirection = document.getElementById("careerDirection");
  const languages = document.getElementById("languages");
  const bio = document.getElementById("bio");
  const saveProfileButton = document.getElementById("saveProfileButton");
  const profileStatus = document.getElementById("profileStatus");

  const summaryAuth = document.getElementById("summaryAuth");
  const summaryName = document.getElementById("summaryName");
  const summaryCareer = document.getElementById("summaryCareer");
  const summaryMarket = document.getElementById("summaryMarket");
  const summaryLanguages = document.getElementById("summaryLanguages");
  const summaryCv = document.getElementById("summaryCv");

  let supabaseClient = null;
  let currentUser = null;
  let currentProfile = null;

  function getConfig() {
    const url = String(window.JAPANOFFER_SUPABASE_URL || window.SUPABASE_URL || "").replace(/\/+$/, "");
    const key = String(
      window.JAPANOFFER_SUPABASE_ANON_KEY ||
      window.JAPANOFFER_SUPABASE_PUBLISHABLE_KEY ||
      window.SUPABASE_ANON_KEY ||
      window.SUPABASE_PUBLISHABLE_KEY ||
      ""
    ).trim();

    if (!url || !key) return null;
    return { url, key };
  }

  function showStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = `status show ${type || "success"}`;
  }

  function clearStatus(el) {
    if (!el) return;
    el.className = "status";
    el.textContent = "";
  }

  function setLocked(isLocked) {
    const elements = [uploadDrop, saveProfileButton, cvInput, fullName, headline, targetMarket, careerDirection, languages, bio];
    elements.forEach((el) => {
      if (!el) return;
      if (isLocked) {
        el.classList.add("locked");
        el.setAttribute("disabled", "disabled");
      } else {
        el.classList.remove("locked");
        el.removeAttribute("disabled");
      }
    });
  }

  function updateSummary() {
    summaryAuth.textContent = currentUser ? "已登录" : "未登录";
    summaryName.textContent = fullName.value || "未填写";
    summaryCareer.textContent = careerDirection.value || "未选择";
    summaryMarket.textContent = targetMarket.value || "未选择";
    summaryLanguages.textContent = languages.value || "未填写";
    summaryCv.textContent = currentProfile?.cv_file_name || "未上传";
  }

  function fillProfile(profile) {
    currentProfile = profile || {};
    fullName.value = currentProfile.full_name || "";
    headline.value = currentProfile.headline || "";
    targetMarket.value = currentProfile.target_market || "";
    careerDirection.value = currentProfile.career_direction || "";
    languages.value = currentProfile.languages || "";
    bio.value = currentProfile.bio || "";

    if (currentProfile.cv_file_name) {
      cvCard.classList.add("show");
      cvName.textContent = currentProfile.cv_file_name;
      cvMeta.textContent = `已保存到你的账号 · ${formatDate(currentProfile.updated_at || currentProfile.created_at)}`;
    } else {
      cvCard.classList.remove("show");
      cvName.textContent = "还没有上传 CV";
      cvMeta.textContent = "上传后会显示文件名和保存时间。";
    }

    updateSummary();
  }

  function formatDate(value) {
    if (!value) return "刚刚";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  }

  function safeFileName(name) {
    return String(name || "cv")
      .replace(/[^\w.\-]+/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 120);
  }

  function isAllowedFile(file) {
    const name = file.name.toLowerCase();
    const okExt = name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx");
    const okSize = file.size <= 5 * 1024 * 1024;
    return okExt && okSize;
  }

  async function loadProfile() {
    if (!currentUser) return;

    const { data, error } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) {
      showStatus(profileStatus, `读取个人资料失败：${error.message}`, "error");
      return;
    }

    if (data) {
      fillProfile(data);
      return;
    }

    // Create an empty profile row for first-time users
    const fallbackName = currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "";

    const { data: created, error: createError } = await supabaseClient
      .from("user_profiles")
      .insert({
        user_id: currentUser.id,
        email: currentUser.email || "",
        full_name: fallbackName
      })
      .select("*")
      .single();

    if (createError) {
      showStatus(profileStatus, `创建个人资料失败：${createError.message}`, "error");
      return;
    }

    fillProfile(created);
  }

  async function saveProfile() {
    if (!currentUser) {
      showStatus(profileStatus, "请先登录，再保存个人资料。", "error");
      return;
    }

    clearStatus(profileStatus);
    saveProfileButton.textContent = "正在保存...";
    saveProfileButton.disabled = true;

    const payload = {
      user_id: currentUser.id,
      email: currentUser.email || "",
      full_name: fullName.value.trim(),
      headline: headline.value.trim(),
      target_market: targetMarket.value,
      career_direction: careerDirection.value,
      languages: languages.value.trim(),
      bio: bio.value.trim(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    saveProfileButton.textContent = "保存个人资料";
    saveProfileButton.disabled = false;

    if (error) {
      showStatus(profileStatus, `保存失败：${error.message}`, "error");
      return;
    }

    fillProfile(data);
    showStatus(profileStatus, "个人资料已保存。", "success");
  }

  async function uploadCv(file) {
    if (!currentUser) {
      showStatus(uploadStatus, "请先登录，再上传 CV。", "error");
      return;
    }

    if (!isAllowedFile(file)) {
      showStatus(uploadStatus, "文件格式或大小不符合要求。请上传 PDF、DOC 或 DOCX，建议不超过 5MB。", "error");
      return;
    }

    clearStatus(uploadStatus);
    showStatus(uploadStatus, "正在上传 CV...", "success");

    const fileName = safeFileName(file.name);
    const path = `${currentUser.id}/${Date.now()}_${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("cvs")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "application/octet-stream"
      });

    if (uploadError) {
      showStatus(uploadStatus, `上传失败：${uploadError.message}`, "error");
      return;
    }

    // Remove old CV file if it exists
    if (currentProfile?.cv_storage_path && currentProfile.cv_storage_path !== path) {
      try {
        await supabaseClient.storage.from("cvs").remove([currentProfile.cv_storage_path]);
      } catch (error) {
        console.warn("Failed to remove old CV", error);
      }
    }

    const { data, error } = await supabaseClient
      .from("user_profiles")
      .upsert({
        user_id: currentUser.id,
        email: currentUser.email || "",
        full_name: fullName.value.trim(),
        headline: headline.value.trim(),
        target_market: targetMarket.value,
        career_direction: careerDirection.value,
        languages: languages.value.trim(),
        bio: bio.value.trim(),
        cv_file_name: file.name,
        cv_storage_path: path,
        cv_uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) {
      showStatus(uploadStatus, `CV 已上传，但保存资料失败：${error.message}`, "error");
      return;
    }

    fillProfile(data);
    showStatus(uploadStatus, "CV 已上传并保存到你的账号。", "success");
  }

  async function openCv() {
    if (!currentUser || !currentProfile?.cv_storage_path) {
      showStatus(uploadStatus, "还没有可打开的 CV。", "error");
      return;
    }

    const { data, error } = await supabaseClient.storage
      .from("cvs")
      .createSignedUrl(currentProfile.cv_storage_path, 60);

    if (error || !data?.signedUrl) {
      showStatus(uploadStatus, `打开失败：${error?.message || "无法生成链接"}`, "error");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function deleteCv() {
    if (!currentUser || !currentProfile?.cv_storage_path) {
      showStatus(uploadStatus, "还没有可删除的 CV。", "error");
      return;
    }

    if (!window.confirm("确定要删除这份 CV 吗？")) return;

    const oldPath = currentProfile.cv_storage_path;

    await supabaseClient.storage.from("cvs").remove([oldPath]);

    const { data, error } = await supabaseClient
      .from("user_profiles")
      .update({
        cv_file_name: null,
        cv_storage_path: null,
        cv_uploaded_at: null,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", currentUser.id)
      .select("*")
      .single();

    if (error) {
      showStatus(uploadStatus, `删除记录失败：${error.message}`, "error");
      return;
    }

    fillProfile(data);
    showStatus(uploadStatus, "CV 已删除。", "success");
  }

  async function init() {
    const config = getConfig();

    if (!config || !window.supabase?.createClient) {
      authBox.innerHTML = `
        <strong>Supabase 配置未读取到</strong>
        <span>请检查 auth-config.js 是否存在，并且里面有项目 URL 和 anon / publishable key。</span>
      `;
      summaryAuth.textContent = "配置缺失";
      setLocked(true);
      return;
    }

    supabaseClient = window.supabase.createClient(config.url, config.key);

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data?.user) {
      currentUser = null;
      authBox.innerHTML = `
        <strong>你还没有登录</strong>
        <span>请先注册或登录。登录后，CV 和个人资料才会永久保存到你的账号下。</span>
        <div class="btn-row">
          <a class="btn primary" href="signup.html">注册 / 登录</a>
        </div>
      `;
      summaryAuth.textContent = "未登录";
      setLocked(true);
      updateSummary();
      return;
    }

    currentUser = data.user;
    authBox.innerHTML = `
      <strong>已登录</strong>
      <span>${currentUser.email || "当前账号"} · 你的 CV 会保存到这个账号。</span>
    `;

    setLocked(false);
    await loadProfile();
  }

  cvInput.addEventListener("change", async () => {
    const file = cvInput.files?.[0];
    if (!file) return;
    await uploadCv(file);
    cvInput.value = "";
  });

  saveProfileButton.addEventListener("click", saveProfile);
  downloadCvButton.addEventListener("click", openCv);
  deleteCvButton.addEventListener("click", deleteCv);

  [fullName, headline, targetMarket, careerDirection, languages].forEach((el) => {
    el.addEventListener("input", updateSummary);
    el.addEventListener("change", updateSummary);
  });

  init();
})();


// Step 27: make profile-to-match always pass source=profile&auto=1
(function () {
  function bindProfileMatchLinks() {
    const links = Array.from(document.querySelectorAll("a, button"));
    links.forEach((el) => {
      const text = String(el.textContent || "").replace(/\s+/g, " ").trim();
      if (text.includes("用我的资料做 AI 匹配") || text.includes("生成匹配报告")) {
        if (el.tagName === "A") {
          el.setAttribute("href", "match.html?source=profile&auto=1");
        } else {
          el.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "match.html?source=profile&auto=1";
          });
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindProfileMatchLinks);
  } else {
    bindProfileMatchLinks();
  }
})();
