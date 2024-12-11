
import MonthlyCart from './MonthlyCart';

import SummaryChart from './SummaryChart';

const Dhome = () => {
  // const token = localStorage.getItem("token");
  // const { data, isLoading } = useDashboardMetricsQuery({ token });


  return (
    <div>
      <div className="row mx-auto my-2 ">
        <SummaryChart />
        <MonthlyCart />
      </div>
      {/* <Summary data={data} isLoading={isLoading} /> */}
    </div>
  );
};

export default Dhome;
