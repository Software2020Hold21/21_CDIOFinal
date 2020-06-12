package dto;


import java.util.List;

public class ReceptDTO {

    private int receptId;
    private String receptNavn;
    private List<ReceptKompDTO> receptKomponenter;

    public ReceptDTO() {
    }

    public ReceptDTO(int receptId, String receptNavn, List<ReceptKompDTO> receptKomponenter) {
        this.receptId = receptId;
        this.receptNavn = receptNavn;
        this.receptKomponenter = receptKomponenter;
    }

    public int getReceptId() {
        return receptId;
    }

    public void setReceptId(int receptId) {
        this.receptId = receptId;
    }

    public String getReceptNavn() {
        return receptNavn;
    }

    public void setReceptNavn(String receptNavn) {
        this.receptNavn = receptNavn;
    }

    public List<ReceptKompDTO> getReceptKomponenter() {
        return receptKomponenter;
    }

    public void setReceptKomponenter(List<ReceptKompDTO> receptKomponenter) {
        this.receptKomponenter = receptKomponenter;
    }
}
