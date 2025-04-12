const generateUniqueCode = (): string => {
    const randomNum = () => Math.floor(Math.random() * 10);

    
    return `BAR${randomNum()}${randomNum()}${randomNum()}-${randomNum()}`;
  };
  
  export default generateUniqueCode;
  