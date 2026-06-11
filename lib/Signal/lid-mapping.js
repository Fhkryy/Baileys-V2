"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIDMappingStore = void 0;

const { jidDecode, isLidUser, isJidUser } = require("../WABinary");

class LIDMappingStore {
    constructor(keys, logger, pnToLIDFunc) {
        this.keys = keys;
        this.logger = logger || console;
        this.pnToLIDFunc = pnToLIDFunc;
        this.mappingCache = new Map();
    }

    async getLIDForPN(pn) {
        if (!pn) return null;
        if (isLidUser(pn)) return pn;

        const decoded = jidDecode(pn);
        if (!decoded) return null;
        const pnUser = decoded.user;

        let lid = this.mappingCache.get(`pn:${pnUser}`);
        if (!lid && this.keys && typeof this.keys.get === 'function') {
            try {
                const stored = await this.keys.get("lid-mapping", [pnUser]);
                if (stored && stored[pnUser]) {
                    lid = stored[pnUser];
                    this.mappingCache.set(`pn:${pnUser}`, lid);
                }
            } catch (err) {
                this.logger?.error({ err, pn }, "Gagal mengambil mapping LID");
            }
        }
        return lid ? `${lid}@lid` : null;
    }

    async getPNForLID(lid) {
        if (!lid) return null;
        if (isJidUser(lid)) return lid;

        const decoded = jidDecode(lid);
        if (!decoded) return null;
        const lidUser = decoded.user;

        let pn = this.mappingCache.get(`lid:${lidUser}`);
        if (!pn && this.keys && typeof this.keys.get === 'function') {
            try {
                const stored = await this.keys.get("lid-mapping", [`${lidUser}_reverse`]);
                if (stored && stored[`${lidUser}_reverse`]) {
                    pn = stored[`${lidUser}_reverse`];
                    this.mappingCache.set(`lid:${lidUser}`, pn);
                }
            } catch (err) {
                this.logger?.error({ err, lid }, "Gagal mengambil reverse mapping LID");
            }
        }
        return pn ? `${pn}@s.whatsapp.net` : null;
    }
}
exports.LIDMappingStore = LIDMappingStore;
