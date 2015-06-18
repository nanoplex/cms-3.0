namespace cms
{
    public class Property
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public object Value { get; set; }

        public string toHTML()
        {
            return $"{Name}='{}' ";
        }
    }
}