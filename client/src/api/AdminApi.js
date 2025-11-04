import axios from 'axios';

const API_URL = '/api';

const getAuthHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

const AdminApi = {
  async getMods(token) {
    const response = await axios.get(`${API_URL}/admin/mods`, getAuthHeader(token));
    return response.data;
  },

  async createMod(token, modData) {
    const { name, description, version, apkUrl, iconUrl } = modData;
    const response = await axios.post(
      `${API_URL}/admin/mods`,
      { name, description, version, apkUrl, iconUrl },
      getAuthHeader(token)
    );
    return response.data;
  },

  async deleteMod(token, modId) {
    const response = await axios.delete(
      `${API_URL}/mods/${modId}`,
      getAuthHeader(token)
    );
    return response.data;
  },

  async createLicenseKeys(token, keyData) {
    const { modId, durationDays, price, count } = keyData;
    const response = await axios.post(
      `${API_URL}/admin/license-keys`,
      { modId, durationDays, price, count },
      getAuthHeader(token)
    );
    return response.data;
  },

  async getAllLicenseKeys(token) {
    const response = await axios.get(
      `${API_URL}/license-keys/all`,
      getAuthHeader(token)
    );
    return response.data.keys || [];
  },

  async getLicenseKeysByMod(token, modId) {
    const response = await axios.get(
      `${API_URL}/license-keys/mod/${modId}`,
      getAuthHeader(token)
    );
    return response.data.keys || [];
  },

  async deleteLicenseKey(token, keyId) {
    const response = await axios.delete(
      `${API_URL}/license-keys/${keyId}`,
      getAuthHeader(token)
    );
    return response.data;
  },

  async deleteAllLicenseKeys(token) {
    const response = await axios.delete(
      `${API_URL}/license-keys/delete-all`,
      getAuthHeader(token)
    );
    return response.data;
  },

  async deleteLicenseKeysByMod(token, modId) {
    const response = await axios.delete(
      `${API_URL}/license-keys/delete-by-mod/${modId}`,
      getAuthHeader(token)
    );
    return response.data;
  },

  async getReferralCodes(token) {
    const response = await axios.get(
      `${API_URL}/admin/referral-codes`,
      getAuthHeader(token)
    );
    return response.data;
  },

  async createReferralCode(token, referralData) {
    const { code, rewardAmount, maxUses } = referralData;
    const response = await axios.post(
      `${API_URL}/admin/referral-codes`,
      { code, rewardAmount, maxUses },
      getAuthHeader(token)
    );
    return response.data;
  },

  async getUsers(token) {
    const response = await axios.get(`${API_URL}/admin/users`, getAuthHeader(token));
    return response.data;
  },

  async updateUserBalance(token, userId, balance) {
    const response = await axios.post(
      `${API_URL}/admin/users/${userId}/balance`,
      { balance },
      getAuthHeader(token)
    );
    return response.data;
  },

  async updateDeviceLimit(token, userId, limit) {
    const response = await axios.post(
      `${API_URL}/admin/users/${userId}/device-limit`,
      { limit },
      getAuthHeader(token)
    );
    return response.data;
  },

  async getPurchases(token) {
    const response = await axios.get(
      `${API_URL}/purchases/all`,
      getAuthHeader(token)
    );
    return response.data.purchases || [];
  },
};

export default AdminApi;
