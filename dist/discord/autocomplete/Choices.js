"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Choices = (() => {
    const choices = new Map();
    const addChoiceGroup = (id, arr) => {
        choices.set(id, arr);
    };
    const getChoiceGroup = (id) => {
        return choices.get(id);
    };
    return {
        addChoiceGroup,
        getChoiceGroup,
    };
})();
exports.default = Choices;
