from abc import ABC, abstractmethod
from typing import List, Dict


class DisasterDataSource(ABC):
    @abstractmethod
    def fetch_new_data(self) -> List[Dict]:
        pass
