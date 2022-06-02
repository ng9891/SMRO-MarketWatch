const Choices = (() => {
  const choices = new Map();

  const addChoiceGroup = (id: string, arr: Array<any>) => {
    choices.set(id, arr);
  };

  const getChoiceGroup = (id: string) => {
    return choices.get(id);
  };

  return {
    addChoiceGroup,
    getChoiceGroup,
  };
})();

export default Choices;